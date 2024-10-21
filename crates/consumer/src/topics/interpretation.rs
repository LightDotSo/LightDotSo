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

use super::TopicConsumer;
use crate::state::ConsumerState;
use async_trait::async_trait;
use eyre::{eyre, Result};
use lightdotso_db::models::{
    interpretation::upsert_interpretation_with_actions, transaction::get_transaction_with_logs,
    user_operation::get_user_operation_with_logs,
};
use lightdotso_interpreter::{
    interpreter::Interpreter,
    types::{InterpretationRequest, InterpretationResponse},
};
use lightdotso_kafka::types::interpretation::InterpretationMessage;
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;
use tokio::sync::Mutex;

// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub struct InterpretationConsumer;

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

#[async_trait]
impl TopicConsumer for InterpretationConsumer {
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
            // Parse the payload into a JSON object, `InterpretationMessage`
            let payload: InterpretationMessage = serde_json::from_slice(payload.as_bytes())?;

            // Log the payload
            info!("payload: {:?}", payload);

            // Consume the payload
            self.consume_with_message(state, consumer_state, payload).await?;
        }

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

impl InterpretationConsumer {
    pub async fn consume_with_message(
        &self,
        state: &ClientState,
        consumer_state: &ConsumerState,
        payload: InterpretationMessage,
    ) -> Result<()> {
        // Get the interpreter
        let interpreter = consumer_state.interpreter.clone();

        // Get the transaction hash
        if let Some(transaction_hash) = payload.transaction_hash {
            // Get the transaction from the database
            let transaction_with_logs =
                get_transaction_with_logs(state.client.clone(), transaction_hash).await?;

            info!("transaction_with_logs: {:?}", transaction_with_logs);

            // Create an `InterpretationRequest` from the transaction
            let request = InterpretationRequest {
                block_number: transaction_with_logs
                    .transaction
                    .clone()
                    .block_number
                    .map(|n| n as u64),
                gas_limit: u64::MAX,
                chain_id: transaction_with_logs.transaction.clone().chain_id as u64,
                from: transaction_with_logs.transaction.clone().from.parse()?,
                to: Some(
                    transaction_with_logs.transaction.clone().to.map(|to| to.parse()).unwrap()?,
                ),
                call_data: transaction_with_logs
                    .transaction
                    .clone()
                    .input
                    .map(|input| input.into()),
                value: transaction_with_logs
                    .transaction
                    .clone()
                    .value
                    .and_then(|value| value.parse::<u64>().ok()),
                traces: vec![],
                logs: transaction_with_logs.logs.into_iter().map(|lx| lx.inner).collect(),
            };
            // Run the interpretation
            let res = self.run_interpretation(&interpreter, request).await?;
            info!("res: {:?}", res);

            // Upsert the interpretation
            upsert_interpretation_with_actions(
                state.client.clone(),
                res.clone(),
                Some(transaction_with_logs.transaction.hash),
                None,
            )
            .await?;
        }

        // If the payload has a user operation hash
        if let Some(user_operation_with_logs) = payload.user_operation_hash {
            // Get the transaction from the database
            let user_operation_with_logs =
                get_user_operation_with_logs(state.client.clone(), user_operation_with_logs)
                    .await?;

            // If the `transaction` field is `None`, then return early
            if user_operation_with_logs.transaction.is_none() {
                return Ok(());
            }

            // Create an `InterpretationRequest` from the transaction
            let request = InterpretationRequest {
                block_number: user_operation_with_logs
                    .transaction
                    .unwrap()
                    .block_number
                    .map(|n| n as u64),
                gas_limit: u64::MAX,
                chain_id: user_operation_with_logs.user_operation.clone().chain_id as u64,
                from: user_operation_with_logs.user_operation.clone().sender.parse()?,
                to: None,
                call_data: Some(user_operation_with_logs.user_operation.clone().call_data.into()),
                value: None,
                traces: vec![],
                logs: user_operation_with_logs.logs.into_iter().map(|lx| lx.inner).collect(),
            };

            // Run the interpretation
            let res = self.run_interpretation(&interpreter, request).await?;
            info!("res: {:?}", res);

            // Upsert the interpretation
            upsert_interpretation_with_actions(
                state.client.clone(),
                res,
                None,
                Some(user_operation_with_logs.user_operation.hash),
            )
            .await?;
        }

        Ok(())
    }

    async fn run_interpretation(
        &self,
        interpreter: &Arc<Mutex<Interpreter<'static>>>,
        request: InterpretationRequest,
    ) -> Result<InterpretationResponse> {
        let mut interpreter_guard = interpreter.lock().await;
        interpreter_guard.run_with_interpret(request).await
    }
}
