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

use alloy::primitives::U256;
use eyre::Result;
use lightdotso_common::traits::U256ToU64;
use lightdotso_contracts::paymaster::{
    decode_paymaster_and_data, get_paymaster, LightPaymaster::senderNonceReturn,
};
use lightdotso_db::models::paymaster_operation::create_paymaster_operation;
use lightdotso_kafka::{
    topics::billing_operation::produce_billing_operation_message,
    types::{
        billing_operation::BillingOperationMessage, paymaster_operation::PaymasterOperationMessage,
    },
};
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, producer::FutureProducer, Message};
use std::sync::Arc;

pub async fn paymaster_operation_consumer(
    producer: Arc<FutureProducer>,
    msg: &BorrowedMessage<'_>,
    db: Arc<PrismaClient>,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `PaymasterOperationMessage`
        let payload: PaymasterOperationMessage = serde_json::from_slice(payload.as_bytes())?;
        info!("payload: {:?}", payload);

        // Get the paymasterAndData.
        if let Ok((verifying_paymaster_address, valid_until, valid_after, _signature)) =
            decode_paymaster_and_data(payload.paymaster_and_data.to_vec())
        {
            // Get the paymaster contract.
            let paymaster_contract =
                get_paymaster(payload.chain_id, verifying_paymaster_address).await?;

            // Call the paymaster contract to get the nonce.
            let paymaster_nonce = paymaster_contract.senderNonce(payload.sender).call().await?._0;

            // Finally, create the paymaster operation.
            let (_, paymaster_operation) = create_paymaster_operation(
                db.clone(),
                payload.chain_id as i64,
                verifying_paymaster_address,
                payload.sender,
                paymaster_nonce.to_u64()? as i64,
                valid_until as i64,
                valid_after as i64,
            )
            .await?;

            produce_billing_operation_message(
                producer,
                &BillingOperationMessage {
                    sender: payload.sender,
                    chain_id: payload.chain_id,
                    paymaster_operation_id: paymaster_operation.id,
                    pre_verification_gas: payload.pre_verification_gas.to_u64()?,
                    verification_gas_limit: payload.verification_gas_limit.to_u64()?,
                    call_gas_limit: payload.call_gas_limit.to_u64()?,
                },
            )
            .await?;
        }
    }

    Ok(())
}
