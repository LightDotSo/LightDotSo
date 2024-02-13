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
use lightdotso_routescan::get_token_balances;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_token_test() -> Result<()> {
    let _ = dotenvy::dotenv();

    let res =
        get_token_balances(&168587773, "0x35da762a35FCb3160738EeCd60fa18438C273D5E", None, None)
            .await?;
    println!("{:#?}", res);

    Ok(())
}
