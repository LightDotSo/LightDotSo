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
use lightdotso_db::{db::create_test_client, models::user_operation::get_user_operation_with_logs};
use std::sync::Arc;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_get_user_operation_with_logs() -> Result<()> {
    // Load the environment variables.
    let _ = dotenvy::dotenv();

    // Create a database client.
    let db = create_test_client().await?;

    // Get a user_operation with logs.
    let tx = get_user_operation_with_logs(
        Arc::new(db),
        "0x12ecd2a1ff50af1423249b945ca089d6c8a1fe118a46956f0007e3e133b1a9f0".parse()?,
    )
    .await?;

    // Print the user_operation.
    println!("{:?}", tx);

    Ok(())
}
