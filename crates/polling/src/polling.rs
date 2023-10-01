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

use crate::config::PollingArgs;
use lightdotso_tracing::tracing::info;

#[derive(Clone)]
pub struct Polling {}

impl Polling {
    pub async fn new(_args: &PollingArgs) -> Self {
        info!("Polling new, starting");

        // Create the polling
        Self {}
    }

    pub async fn run(&self) {
        info!("Polling run, starting");

        loop {
            // Sleep for 3 minutes and info log the timestamp
            tokio::time::sleep(std::time::Duration::from_secs(180)).await;
            info!("Polling run, timestamp: {}", chrono::Utc::now());
        }
    }
}
