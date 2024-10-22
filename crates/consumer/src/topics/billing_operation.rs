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

use crate::{state::ConsumerState, topics::TopicConsumer};
use async_trait::async_trait;
use eyre::{eyre, Result};
use lightdotso_kafka::types::billing_operation::BillingOperationMessage;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct BillingOperationConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for BillingOperationConsumer {
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
            // Parse the payload into a JSON object, `BillingOperationMessage`
            let payload: BillingOperationMessage = serde_json::from_slice(payload.as_bytes())?;
            info!("payload: {:?}", payload);

            // Consume the payload
            self.consume_with_message(state, consumer_state, payload).await?;
        }

        Ok(())
    }
}

impl BillingOperationConsumer {
    pub async fn consume_with_message(
        &self,
        _state: &ClientState,
        consumer_state: &ConsumerState,
        payload: BillingOperationMessage,
    ) -> Result<()> {
        // Run the billing operation
        consumer_state.billing.run_pending(&payload).await?;

        Ok(())
    }
}
