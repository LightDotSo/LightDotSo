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
use lightdotso_contracts::types::{GasAndPaymasterAndData, UserOperation};
use lightdotso_kafka::{
    get_producer, topics::paymaster_operation::produce_paymaster_operation_message,
    types::paymaster_operation::PaymasterOperationMessage,
};
use std::sync::Arc;

// Create the billing operation message.
pub async fn create_billing_operation_msg(
    chain_id: u64,
    user_operation: UserOperation,
    gas_and_paymaster_and_data: GasAndPaymasterAndData,
) -> Result<()> {
    // Get the producer.
    let producer = Arc::new(get_producer()?);

    // Construct the paymaster operation message.
    let paymaster_operation_message = PaymasterOperationMessage {
        chain_id,
        sender: user_operation.sender,
        call_gas_limit: gas_and_paymaster_and_data.call_gas_limit,
        verification_gas_limit: gas_and_paymaster_and_data.verification_gas_limit,
        pre_verification_gas: gas_and_paymaster_and_data.pre_verification_gas,
        paymaster_and_data: gas_and_paymaster_and_data.paymaster_and_data,
    };

    // Produce the paymaster operation message.
    produce_paymaster_operation_message(producer, &paymaster_operation_message).await?;

    Ok(())
}
