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

use eyre::{eyre, Result};
use lightdotso_db::models::activity::create_activity_with_user_and_wallet;
use lightdotso_kafka::types::activity::ActivityMessage;
use lightdotso_prisma::{ActivityEntity, ActivityOperation, PrismaClient};
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

// -----------------------------------------------------------------------------
// Traits
// -----------------------------------------------------------------------------

pub trait FromStrExt: Sized {
    fn from_str_ext(s: &str) -> Result<Self>;
}

impl FromStrExt for ActivityEntity {
    fn from_str_ext(s: &str) -> Result<Self> {
        match s {
            "WALLET" => Ok(Self::Wallet),
            "USER" => Ok(Self::User),
            "INVITE_CODE" => Ok(Self::InviteCode),
            "SUPPORT_REQUEST" => Ok(Self::SupportRequest),
            "WALLET_SETTINGS" => Ok(Self::WalletSettings),
            "FEEDBACK" => Ok(Self::Feedback),
            "NOTIFICATION" => Ok(Self::Notification),
            "USER_OPERATION" => Ok(Self::UserOperation),
            "TRANSACTION" => Ok(Self::Transaction),
            _ => Err(eyre!("no match for input string")),
        }
    }
}

impl FromStrExt for ActivityOperation {
    fn from_str_ext(s: &str) -> Result<Self> {
        match s {
            "CREATE" => Ok(Self::Create),
            "UPDATE" => Ok(Self::Update),
            "DELETE" => Ok(Self::Delete),
            _ => Err(eyre!("no match for input string")),
        }
    }
}
// -----------------------------------------------------------------------------
// Consumer
// -----------------------------------------------------------------------------

pub async fn activity_consumer(msg: &BorrowedMessage<'_>, db: Arc<PrismaClient>) -> Result<()> {
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

    // Convert the key to a string
    let key = msg.key_view::<str>();

    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the key is not empty, then we can parse it
    if let Some(Ok(key)) = key {
        let entity = ActivityEntity::from_str_ext(key)?;

        // If the payload is valid
        if let Some(Ok(payload)) = payload_opt {
            // Try to deserialize the payload as json
            let payload: ActivityMessage = serde_json::from_slice(payload.as_bytes())?;

            // Create activity with user and wallet
            let _ = create_activity_with_user_and_wallet(
                db,
                entity,
                payload.operation,
                payload.log.clone(),
                payload.params,
            )
            .await;
        }
    }

    Ok(())
}
