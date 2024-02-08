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
use lightdotso_kafka::types::notification::NotificationMessage;
use lightdotso_notifier::{notifier::Notifier, types::match_notification_with_activity};
use lightdotso_prisma::{activity, PrismaClient};
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

pub async fn notification_consumer(
    msg: &BorrowedMessage<'_>,
    notifier: &Notifier,
    db: Arc<PrismaClient>,
) -> Result<()> {
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

        // Get the activity from the database
        let activity =
            db.activity().find_unique(activity::id::equals(payload.activity_id)).exec().await?;

        // If the activity exists
        if let Some(entity) = activity {
            // Match the notification with the activity
            let res =
                match_notification_with_activity(&entity.entity, &entity.operation, &entity.log);

            // Check if the notification should be sent or not
            if let Some(res) = res {
                info!("res: {:?}", res);

                // Send the notification
            }

            notifier.run().await;
        }
    }

    Ok(())
}
