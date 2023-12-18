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
use lightdotso_pusher::{channel::TEST_CHANNEL, event::TEST_EVENT, get_pusher};
use std::collections::HashMap;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_test() -> Result<()> {
    let pusher = get_pusher()?;

    let mut hash_map = HashMap::new();
    hash_map.insert("message", "hello world from rust");

    let res = pusher.trigger(TEST_CHANNEL.as_str(), TEST_EVENT.as_str(), &hash_map).await;

    assert!(res.is_ok());

    Ok(())
}
