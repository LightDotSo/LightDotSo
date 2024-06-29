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

use eyre::Result;
use lightdotso_pusher::{channel::TEST_CHANNEL, event::TEST_EVENT, get_pusher};
use std::collections::HashMap;

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_test() -> Result<()> {
    let _ = dotenvy::dotenv();

    let pusher = get_pusher()?;

    let mut hash_map = HashMap::new();
    hash_map.insert("message", "hello world from rust");

    let res = pusher.trigger(TEST_CHANNEL.as_str(), TEST_EVENT.as_str(), &hash_map).await;

    assert!(res.is_ok());

    Ok(())
}
