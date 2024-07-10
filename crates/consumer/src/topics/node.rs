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

use eyre::Result;
use lightdotso_contracts::constants::ENTRYPOINT_V060_ADDRESS;
use lightdotso_db::models::user_operation::get_user_operation_with_chain_id;
use lightdotso_kafka::types::node::NodeMessage;
use lightdotso_node::node::Node;
use lightdotso_prisma::PrismaClient;
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
        let (uop, chain_id) = get_user_operation_with_chain_id(db.clone(), hash).await?;

        // Attempt to submit the user operation to the node
        let res = node.send_user_operation(chain_id, *ENTRYPOINT_V060_ADDRESS, &uop).await?;

        // Log the response
        info!("res: {:?}", res);
    }

    Ok(())
}
