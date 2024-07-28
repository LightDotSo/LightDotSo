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
use lightdotso_billing::billing::Billing;
use lightdotso_kafka::types::billing_operation::BillingOperationMessage;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};

pub async fn billing_operation_consumer(
    billing: &Billing,
    msg: &BorrowedMessage<'_>,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `BillingOperationMessage`
        let payload: BillingOperationMessage = serde_json::from_slice(payload.as_bytes())?;
        info!("payload: {:?}", payload);

        // Run the billing operation
        billing.run_pending(&payload).await?;
    }

    Ok(())
}
