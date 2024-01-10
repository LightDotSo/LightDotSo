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

use eyre::Result;
use lightdotso_kafka::types::interpretation::InterpretationMessage;
use lightdotso_prisma::{transaction, user_operation, PrismaClient};
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
        let transaction = db
            .transaction()
            .find_unique(transaction::hash::equals(format!("{:?}", payload.transaction_hash)))
            .exec()
            .await?;

        // If the user operation hash is not empty, get the user operation from the database
        let _user_operation = if let Some(user_operation_hash) = payload.user_operation_hash {
            db.user_operation()
                .find_unique(user_operation::hash::equals(format!("{:?}", user_operation_hash)))
                .exec()
                .await?
        } else {
            None
        };

        if let Some(_tx) = transaction {
            // Get the transaction receipt
        }
    }

    Ok(())
}
