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

use crate::{
    namespace::USER_OPERATION, produce_message, traits::ToJson,
    types::user_operation::UserOperationMessage,
};
use eyre::Result;
pub use rdkafka;
use rdkafka::producer::FutureProducer;
use std::sync::Arc;

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with UserOperation topic.
pub async fn produce_user_operation_message(
    producer: Arc<FutureProducer>,
    msg: &UserOperationMessage,
) -> Result<()> {
    let message = msg.to_json();

    produce_message(producer, USER_OPERATION.as_str(), &message, None).await?;
    Ok(())
}
