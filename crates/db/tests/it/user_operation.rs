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
use lightdotso_db::{db::create_client, models::user_operation::get_user_operation_with_logs};
use std::sync::Arc;

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_get_user_operation_with_logs() -> Result<()> {
    // Load the environment variables.
    let _ = dotenvy::dotenv();

    // Create a database client.
    let db = create_client().await?;

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
