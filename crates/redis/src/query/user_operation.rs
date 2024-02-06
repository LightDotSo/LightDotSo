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
