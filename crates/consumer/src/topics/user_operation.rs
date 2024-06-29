// Copyright 2023-2024 Light
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
use lightdotso_kafka::types::user_operation::UserOperationMessage;
use lightdotso_polling::polling::Polling;
use lightdotso_prisma::{user_operation, PrismaClient, UserOperationStatus};
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

pub async fn user_operation_consumer(
    msg: &BorrowedMessage<'_>,
    poller: &Polling,
    db: Arc<PrismaClient>,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `UserOperationMessage`
        let payload: UserOperationMessage = serde_json::from_slice(payload.as_bytes())?;
        info!("payload: {:?}", payload);

        // If the `is_pending_update` field is true, then update the user operation state in the db
        info!("is_pending_update: {:?}", payload.is_pending_update);
        if payload.is_pending_update {
            let _ = db
                .user_operation()
                .update(
                    user_operation::hash::equals(format!("{:?}", payload.hash)),
                    vec![user_operation::status::set(UserOperationStatus::Pending)],
                )
                .exec()
                .await?;
        }

        // Run the user operation poller
        poller.run_uop(payload.chain_id, payload.hash).await?;
    }

    Ok(())
}
