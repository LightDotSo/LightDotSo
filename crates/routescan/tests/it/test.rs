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
use lightdotso_routescan::{get_native_balance, get_token_balances};

// From: https://routescan.io/documentation/api-swagger
// Thank you to the Routescan team for providing this API!
// Example: https://api.routescan.io/v2/network/testnet/evm/168587773/address/0x35da762a35FCb3160738EeCd60fa18438C273D5E/erc20-holdings?limit=25

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_token_test() -> Result<()> {
    let _ = dotenvy::dotenv();

    let res =
        get_token_balances(&168587773, "0x35da762a35FCb3160738EeCd60fa18438C273D5E", None, None)
            .await?;
    println!("{:#?}", res);

    Ok(())
}

// Example: https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan/api?module=account&action=balance&address=0x35da762a35FCb3160738EeCd60fa18438C273D5E&tag=latest

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_native_test() -> Result<()> {
    let _ = dotenvy::dotenv();

    let res = get_native_balance(&168587773, "0x35da762a35FCb3160738EeCd60fa18438C273D5E").await?;
    println!("{:#?}", res);

    Ok(())
}
