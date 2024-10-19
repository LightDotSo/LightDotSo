// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![allow(clippy::unwrap_used)]

use std::sync::Arc;

use super::TopicConsumer;
use crate::state::ConsumerState;
use alloy::rpc::types::Block;
use async_trait::async_trait;
use backon::{ExponentialBuilder, Retryable};
use eyre::{eyre, Result};
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
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::{error, info, warn};
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct TransactionConsumer;

#[async_trait]
impl TopicConsumer for TransactionConsumer {
    async fn consume(
        &self,
        state: &ClientState,
        consumer_state: Option<&ConsumerState>,
        msg: &BorrowedMessage<'_>,
    ) -> Result<()> {
        // Since we use consumer_state, we need to unwrap it
        let consumer_state = consumer_state.ok_or_else(|| eyre!("Consumer state is None"))?;

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

            // Clone the indexer
            let mut indexer_arc = consumer_state.indexer.clone();
            let indexer =
                Arc::get_mut(&mut indexer_arc).ok_or_else(|| eyre!("Failed to get indexer"))?;

            let maybe_block = if maybe_block_number != 0 {
                indexer.get_block_with_internal(maybe_block_number, chain_id).await
            } else {
                // Return an error
                Err(eyre!("Block number is 0".to_string()))
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
            match serde_json::from_slice::<(Block, u64)>(payload_block.as_bytes()) {
                Ok((block, chain_id)) => {
                    // Get the block number
                    let block_number = block.header.number;

                    // Log each message as an example.
                    info!("Indexing block: {:?} at chain_id: {:?}", block_number, chain_id);

                    // Index the block
                    let res = indexer
                        .index_with_internal(state.client.clone(), block.clone(), chain_id)
                        .await;

                    // Write the metric to prometheus
                    let value_to_add = if res.is_ok() { 1.0 } else { 0.0 };
                    ConsumerMetrics::set_index_block(value_to_add, chain_id, block_number);

                    // Commit the message
                    if let Err(e) = res {
                        error!("Error while indexing block: {:?}", e);
                        warn!("Adding block to retry queue");
                        // Create a new producer
                        let client = state.producer.clone();
                        let topic = msg.topic();

                        if topic == TRANSACTION.to_string() ||
                            topic == RETRY_TRANSACTION.to_string()
                        {
                            info!(
                                "Block: {:?} at chain_id: {:?} error, adding to retry queue: 0",
                                block.header.number, chain_id
                            );
                            let _ =
                                { || produce_retry_transaction_0_message(client.clone(), payload) }
                                    .retry(ExponentialBuilder::default())
                                    .await;
                        } else if topic == RETRY_TRANSACTION_0.to_string() {
                            info!(
                                "Block: {:?} at chain_id: {:?} error, adding to retry queue: 1",
                                block.header.number, chain_id
                            );
                            let _ =
                                { || produce_retry_transaction_1_message(client.clone(), payload) }
                                    .retry(ExponentialBuilder::default())
                                    .await;
                        } else if topic == RETRY_TRANSACTION_1.to_string() {
                            info!(
                                "Block: {:?} at chain_id: {:?} error, adding to retry queue: 2",
                                block.header.number, chain_id
                            );
                            let _ =
                                { || produce_retry_transaction_2_message(client.clone(), payload) }
                                    .retry(ExponentialBuilder::default())
                                    .await;
                        } else if topic == RETRY_TRANSACTION_2.to_string() {
                            warn!(
                                "Block: {:?} at chain_id: {:?} error, adding to error queue",
                                block.header.number, chain_id
                            );
                            let _ =
                                { || produce_error_transaction_message(client.clone(), payload) }
                                    .retry(ExponentialBuilder::default())
                                    .await;
                        }
                    }

                    // Log success
                    info!(
                        "Successfully indexed block: {:?} at chain_id: {:?}",
                        block.header.number, chain_id
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
}
