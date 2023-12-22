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

use crate::{namespace::ACTIVITY, produce_message};
use eyre::Result;
use lightdotso_db::models::activity::CustomParams;
use lightdotso_prisma::{ActivityEntity, ActivityOperation};
pub use rdkafka;
use rdkafka::producer::FutureProducer;
use serde_json::{json, Value};
use std::sync::Arc;

// Produce a message with Activity topic.
pub async fn produce_activity_message(
    producer: Arc<FutureProducer>,
    entity: ActivityEntity,
    operation: ActivityOperation,
    log: Value,
    params: CustomParams,
) -> Result<()> {
    let message = json!({
        "operation": operation,
        "log": log,
        "params": params,
    })
    .to_string();

    produce_message(producer, ACTIVITY.as_str(), &message, Some(&entity.to_string())).await?;
    Ok(())
}
