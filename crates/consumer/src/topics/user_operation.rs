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

use super::TopicConsumer;
use crate::state::ConsumerState;
use async_trait::async_trait;
use eyre::{eyre, Result};
use lightdotso_kafka::types::user_operation::UserOperationMessage;
use lightdotso_prisma::{user_operation, UserOperationStatus};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct UserOperationConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for UserOperationConsumer {
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
        info!("payload_opt: {:?}", payload_opt);

        // If the payload is valid
        if let Some(Ok(payload)) = payload_opt {
            // Parse the payload into a JSON object, `UserOperationMessage`
            let payload: UserOperationMessage = serde_json::from_slice(payload.as_bytes())?;
            info!("payload: {:?}", payload);

            // Consume the message
            self.consume_with_message(state, consumer_state, payload).await?;
        }

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl UserOperationConsumer {
    async fn consume_with_message(
        &self,
        state: &ClientState,
        consumer_state: &ConsumerState,
        payload: UserOperationMessage,
    ) -> Result<()> {
        // Update the user operation status to pending
        let _ = state
            .client
            .user_operation()
            .update(
                user_operation::hash::equals(format!("{:?}", payload.hash)),
                vec![user_operation::status::set(UserOperationStatus::Pending)],
            )
            .exec()
            .await?;

        // Run the user operation poller
        consumer_state.polling.run_uop(payload.chain_id, payload.hash).await?;

        Ok(())
    }
}
