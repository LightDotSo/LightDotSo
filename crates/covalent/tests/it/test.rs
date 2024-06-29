// Copyright 2023-2024 Light
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
use lightdotso_covalent::{get_token_balances, get_transactions};

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_token_test() -> Result<()> {
    let _ = dotenvy::dotenv();

    let res =
        get_token_balances("1", "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", None, None).await?;
    println!("{:#?}", res);

    Ok(())
}

#[ignore]
#[tokio::test(flavor = "multi_thread")]
async fn test_integration_transactions_test() -> Result<()> {
    let _ = dotenvy::dotenv();

    let res =
        get_transactions("137", "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", None, None).await?;
    println!("{:#?}", res);

    // insta::assert_debug_snapshot!(res);

    Ok(())
}
