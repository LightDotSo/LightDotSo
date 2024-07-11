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

use ethers::{types::Address, utils::to_checksum};
use eyre::Result;
use lightdotso_client::get_user_operaton_signature;
use lightdotso_common::traits::VecU8ToHex;
use lightdotso_contracts::{constants::ENTRYPOINT_V060_ADDRESS, light_wallet::get_light_wallet};
use lightdotso_db::models::user_operation::get_user_operation_with_chain_id;
use lightdotso_kafka::types::node::NodeMessage;
use lightdotso_node::node::Node;
use lightdotso_prisma::{configuration, PrismaClient};
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

pub async fn node_consumer(
    msg: &BorrowedMessage<'_>,
    node: &Node,
    db: Arc<PrismaClient>,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `NodeMessage`
        let payload: NodeMessage = serde_json::from_slice(payload.as_bytes())?;
        info!("payload: {:?}", payload);

        // Get the hash from the payload
        let hash = payload.hash;

        // Get the unique user operation from the db
        let (mut uop, chain_id) = get_user_operation_with_chain_id(db.clone(), hash).await?;

        // Inner function to get the configuration id
        async fn get_configuration_id(
            db: Arc<PrismaClient>,
            chain_id: u64,
            sender: Address,
        ) -> Result<Option<String>> {
            // Get the light wallet contract
            let light_wallet_contract = get_light_wallet(chain_id, sender).await?;

            // Get the image from the chain_id
            let image_hash: [u8; 32] = light_wallet_contract.image_hash().await?;

            // Get the configuration from the chain_id
            let configuration = db
                .configuration()
                .find_unique(configuration::address_image_hash(
                    to_checksum(&sender, None),
                    image_hash.to_vec().to_hex_string(),
                ))
                .exec()
                .await?;

            // Get the configuration id
            let configuration_id = configuration.map(|c| c.id);

            // Log the configuration id
            info!("configuration_id: {:?}", configuration_id);

            Ok(configuration_id)
        }

        // Get the configuration id
        let configuration_id =
            get_configuration_id(db.clone(), chain_id, uop.sender).await.unwrap_or_default();

        // Get the user operation signature
        let signature = get_user_operaton_signature(hash, configuration_id).await?;

        // Set the signature
        uop.signature = signature.into();

        // Attempt to submit the user operation to the node
        let res = node.send_user_operation(chain_id, *ENTRYPOINT_V060_ADDRESS, &uop).await?;

        // Log the response
        info!("res: {:?}", res);
    }

    Ok(())
}
