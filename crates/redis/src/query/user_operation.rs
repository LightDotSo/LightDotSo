// Copyright 2023-2024 Light.
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

use crate::{namespace::QUEUE_USER_OPERATION, rate_limit::RateLimiter};
use eyre::Result;
use lightdotso_tracing::tracing::info;
use redis::Client;
use std::{sync::Arc, time::Duration};

/// Add the user_operation rate limit to the redis database.
pub fn user_operation_rate_limit(client: Arc<Client>, address: String) -> Result<()> {
    let mut rate_limit = RateLimiter::open(client)?;
    let size = Duration::from_secs(300);

    rate_limit.record_fixed_window(&QUEUE_USER_OPERATION, &address, size)?;
    let count = rate_limit.fetch_fixed_window(&QUEUE_USER_OPERATION, &address, size)?;
    info!("user_operation rate count: {}", count);

    if count > 3 {
        return Err(eyre::eyre!("Rate limit exceeded by {} for {}", count, address));
    }

    Ok(())
}
