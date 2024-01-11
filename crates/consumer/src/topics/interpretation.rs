// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

#![allow(clippy::unwrap_used)]

use clap::Parser;
use eyre::Result;
use lightdotso_db::models::{
    transaction::get_transaction_with_logs, user_operation::get_user_operation_with_logs,
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

        // Get the transaction from the database
        let transaction_with_logs =
            get_transaction_with_logs(db.clone(), payload.transaction_hash).await?;

        // If the user operation hash is not empty, get the user operation from the database
        let _user_operation_with_logs =
            if let Some(user_operation_hash) = payload.user_operation_hash {
                Some(get_user_operation_with_logs(db, user_operation_hash).await?)
            } else {
                None
            };

        let args = InterpreterArgs::parse_from([""]);

        let request = InterpretationRequest {
            block_number: transaction_with_logs.transaction.clone().block_number.map(|n| n as u64),
            gas_limit: u64::MAX,
            chain_id: transaction_with_logs.transaction.clone().chain_id as u64,
            from: transaction_with_logs.transaction.clone().from.parse()?,
            to: transaction_with_logs.transaction.clone().to.map(|to| to.parse()).unwrap()?,
            call_data: transaction_with_logs.transaction.clone().input.map(|input| input.into()),
            value: transaction_with_logs
                .transaction
                .clone()
                .value
                .map(|value| value.parse::<u64>().unwrap()),
            traces: vec![],
            logs: transaction_with_logs.logs,
        };

        let _res = args.run_interpretation(request).await?;
    }

    Ok(())
}
