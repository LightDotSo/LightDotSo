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

use clap::Parser;
use eyre::Result;
use lightdotso_db::models::{
    interpretation::upsert_interpretation_with_actions, transaction::get_transaction_with_logs,
    user_operation::get_user_operation_with_logs,
};
use lightdotso_interpreter::{config::InterpreterArgs, types::InterpretationRequest};
use lightdotso_kafka::types::interpretation::InterpretationMessage;
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

pub async fn interpretation_consumer(
    msg: &BorrowedMessage<'_>,
    db: Arc<PrismaClient>,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `InterpretationMessage`
        let payload: InterpretationMessage = serde_json::from_slice(payload.as_bytes())?;

        info!("payload: {:?}", payload);

        let args = InterpreterArgs::parse_from([""]);

        // If the payload has a transaction hash
        if let Some(transaction_hash) = payload.transaction_hash {
            // Get the transaction from the database
            let transaction_with_logs =
                get_transaction_with_logs(db.clone(), transaction_hash).await?;

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
                logs: transaction_with_logs.logs,
            };

            // Run the interpretation
            let res = args.clone().run_interpretation(request).await?;

            info!("res: {:?}", res);

            // Upsert the interpretation
            upsert_interpretation_with_actions(
                db.clone(),
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
                get_user_operation_with_logs(db.clone(), user_operation_with_logs).await?;

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
                logs: user_operation_with_logs.logs,
            };

            // Run the interpretation
            let res = args.run_interpretation(request).await?;

            // Upsert the interpretation
            upsert_interpretation_with_actions(
                db,
                res,
                None,
                Some(user_operation_with_logs.user_operation.hash),
            )
            .await?;
        }
    }

    Ok(())
}
