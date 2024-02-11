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
use lightdotso_kafka::types::user_operation::UserOperationMessage;
use lightdotso_polling::polling::Polling;
use lightdotso_prisma::{user_operation, PrismaClient, UserOperationStatus};
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

pub async fn user_operation_consumer(
    msg: &BorrowedMessage<'_>,
    poller: &Polling,
    db: Arc<PrismaClient>,
) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `UserOperationMessage`
        let payload: UserOperationMessage = serde_json::from_slice(payload.as_bytes())?;
        info!("payload: {:?}", payload);

        // If the `is_pending_update` field is true, then update the user operation state in the db
        info!("is_pending_update: {:?}", payload.is_pending_update);
        if payload.is_pending_update {
            let _ = db
                .user_operation()
                .update(
                    user_operation::hash::equals(format!("{:?}", payload.hash)),
                    vec![user_operation::status::set(UserOperationStatus::Pending)],
                )
                .exec()
                .await?;
        }

        // Run the user operation poller
        poller.run_uop(payload.chain_id, payload.hash).await?;
    }

    Ok(())
}
