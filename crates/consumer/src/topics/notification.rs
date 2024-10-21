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
use lightdotso_kafka::types::notification::NotificationMessage;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct NotificationConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for NotificationConsumer {
    async fn consume(
        &self,
        state: &ClientState,
        consumer_state: Option<&ConsumerState>,
        msg: &BorrowedMessage<'_>,
    ) -> Result<()> {
        // Since we use consumer_state, we need to unwrap it
        let consumer_state = consumer_state.ok_or_else(|| eyre!("Consumer state is None"))?;

        // Send webhook if exists
        info!(
            "key: '{:?}', payload: '{:?}',  topic: {}, partition: {}, offset: {}, timestamp: {:?}",
            msg.key(),
            msg.payload_view::<str>(),
            msg.topic(),
            msg.partition(),
            msg.offset(),
            msg.timestamp()
        );

        // Convert the payload to a string
        let payload_opt = msg.payload_view::<str>();
        info!("payload_opt: {:?}", payload_opt);

        // If the payload is valid
        if let Some(Ok(payload)) = payload_opt {
            // Try to deserialize the payload as json
            let payload: NotificationMessage = serde_json::from_slice(payload.as_bytes())?;
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

impl NotificationConsumer {
    async fn consume_with_message(
        &self,
        state: &ClientState,
        consumer_state: &ConsumerState,
        payload: NotificationMessage,
    ) -> Result<()> {
        // Run the create notification
        let res = consumer_state.notifier.run_with_db(&state.client.clone(), &payload).await;
        info!("res: {:?}", res);

        Ok(())
    }
}
