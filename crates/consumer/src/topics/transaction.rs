// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

#![allow(clippy::unwrap_used)]

use backon::{ExponentialBuilder, Retryable};
use ethers::types::{Block, H256};
use eyre::Result;
use lightdotso_indexer::indexer::Indexer;
use lightdotso_kafka::{
    namespace::{
        RETRY_TRANSACTION, RETRY_TRANSACTION_0, RETRY_TRANSACTION_1, RETRY_TRANSACTION_2,
        TRANSACTION,
    },
    topics::transaction::{
        produce_error_transaction_message, produce_retry_transaction_0_message,
        produce_retry_transaction_1_message, produce_retry_transaction_2_message,
    },
};
use lightdotso_opentelemetry::consumer::ConsumerMetrics;
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::{error, info, warn};
use rdkafka::message::BorrowedMessage;
use rdkafka::{producer::FutureProducer, Message};
use std::sync::Arc;

pub async fn transaction_consumer(
    producer: Arc<FutureProducer>,
    topic: &str,
    msg: &BorrowedMessage<'_>,
    db: Arc<PrismaClient>,
    mut indexer: Indexer,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Try to deserialize the payload as (u64, u64)
        let (maybe_block_number, chain_id): (u64, u64) =
            match serde_json::from_slice(payload.as_bytes()) {
                Ok(payload) => {
                    info!("Successfully deserialized payload: {:?}", payload);
                    payload
                }
                Err(_) => (0, 0),
            };

        // Get the block if number is not 0
        let maybe_block = if maybe_block_number != 0 {
            indexer.get_block_with_internal(maybe_block_number, chain_id).await
        } else {
            // Return an error
            Err(ethers::providers::ProviderError::CustomError("Block number is 0".to_string()))
        };

        // If the block is valid, put as payload_block in bytes format w/
        // (Block<H256>, u64)
        let payload_block = match maybe_block {
            Ok(block) => {
                // If block is Some, get the chain id
                // Get the chain id
                if let Some(block) = block {
                    // Serialize the block and chain id
                    serde_json::to_string(&(block, chain_id))?
                } else {
                    warn!("Block is None");
                    return Ok(());
                }
            }
            Err(_) => payload.to_string(),
        };

        // Deserialize the payload
        match serde_json::from_slice::<(Block<H256>, u64)>(payload_block.as_bytes()) {
            Ok((block, chain_id)) => {
                // Get the block number
                let block_number = block.number.unwrap().as_u64();

                // Log each message as an example.
                info!("Indexing block: {:?} at chain_id: {:?}", block_number, chain_id);

                // Index the block
                let res = indexer.index_with_internal(db.clone(), block.clone(), chain_id).await;

                // Write the metric to prometheus
                let value_to_add = if res.is_ok() { 1.0 } else { 0.0 };
                ConsumerMetrics::set_index_block(value_to_add, chain_id, block_number);

                // Commit the message
                if let Err(e) = res {
                    error!("Error while indexing block: {:?}", e);
                    warn!("Adding block to retry queue");
                    // Create a new producer
                    let client = producer;

                    if topic == TRANSACTION.to_string() || topic == RETRY_TRANSACTION.to_string() {
                        info!(
                            "Block: {:?} at chain_id: {:?} error, adding to retry queue: 0",
                            block.number.unwrap().as_u64(),
                            chain_id
                        );
                        let _ = { || produce_retry_transaction_0_message(client.clone(), payload) }
                            .retry(&ExponentialBuilder::default())
                            .await;
                    } else if topic == RETRY_TRANSACTION_0.to_string() {
                        info!(
                            "Block: {:?} at chain_id: {:?} error, adding to retry queue: 1",
                            block.number.unwrap().as_u64(),
                            chain_id
                        );
                        let _ = { || produce_retry_transaction_1_message(client.clone(), payload) }
                            .retry(&ExponentialBuilder::default())
                            .await;
                    } else if topic == RETRY_TRANSACTION_1.to_string() {
                        info!(
                            "Block: {:?} at chain_id: {:?} error, adding to retry queue: 2",
                            block.number.unwrap().as_u64(),
                            chain_id
                        );
                        let _ = { || produce_retry_transaction_2_message(client.clone(), payload) }
                            .retry(&ExponentialBuilder::default())
                            .await;
                    } else if topic == RETRY_TRANSACTION_2.to_string() {
                        warn!(
                            "Block: {:?} at chain_id: {:?} error, adding to error queue",
                            block.number.unwrap().as_u64(),
                            chain_id
                        );
                        let _ = { || produce_error_transaction_message(client.clone(), payload) }
                            .retry(&ExponentialBuilder::default())
                            .await;
                    }
                }

                // Log success
                info!(
                    "Successfully indexed block: {:?} at chain_id: {:?}",
                    block.number.unwrap().as_u64(),
                    chain_id
                );
            }
            Err(e) => {
                warn!("Error while deserializing message payload: {:?}", e);
                return Ok(());
            }
        };
    }

    Ok(())
}
