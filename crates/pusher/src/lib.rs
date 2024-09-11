// Copyright 2023-2024 LightDotSo.
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

use eyre::Result;
use pusher_rs::{PusherClient, PusherConfig};
use std::time::Duration;

pub mod channel;
pub mod event;

/// Get a Pusher consumer with the required settings.
pub fn get_pusher() -> Result<PusherClient> {
    let config = PusherConfig {
        app_id: std::env::var("SOKETI_DEFAULT_APP_ID")?,
        app_key: std::env::var("SOKETI_DEFAULT_APP_KEY")?,
        app_secret: std::env::var("PUSHER_SECRET")?,
        cluster: "DEFAULT".to_string(),
        use_tls: true,
        host: Some("soketi.light.so".to_string()),
        max_reconnection_attempts: 10,
        backoff_interval: Duration::from_secs(2),
        activity_timeout: Duration::from_secs(180),
        pong_timeout: Duration::from_secs(45),
    };

    // Create a Pusher provider
    let pusher = PusherClient::new(config)?;

    Ok(pusher)
}
