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
use lightdotso_db::{db::create_client, models::transaction::get_transaction};
use std::sync::Arc;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_get_transaction() -> Result<()> {
    let _ = dotenvy::dotenv();

    let db = create_client().await?;

    let tx = get_transaction(
        Arc::new(db),
        "0x0eba351b13320cf51b42e5218e63c90698ba73bceb65e5a38f146685fe1407fa".parse()?,
    )
    .await?;

    println!("{:?}", tx);

    Ok(())
}
