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

use alloy::primitives::B256;
use dotenvy::dotenv;
use eyre::Result;
use lightdotso_graphql::{
    constants::{THE_GRAPH_STUDIO_BASE_URL, THE_GRAPH_STUDIO_SERVICE_IDS},
    polling::user_operations::{run_user_operation_query, GetUserOperationQueryVariables},
};

#[ignore]
#[tokio::test]
async fn test_integration_run_query() -> Result<()> {
    // Load the environment variables.
    let _ = dotenv();

    let hash: B256 =
        "0x35bef2d3da16e9f4621a6e4852afcc939c64e949def198d4c542c4d9f3f0ee21".parse()?;

    let id = THE_GRAPH_STUDIO_SERVICE_IDS.get(&137).unwrap();

    let url = format!(
        "{}/{}/{}/{}",
        THE_GRAPH_STUDIO_BASE_URL.clone(),
        std::env::var("THE_GRAPH_STUDIO_API_KEY").unwrap(),
        "subgraphs/id",
        id
    );

    let res = run_user_operation_query(
        url,
        GetUserOperationQueryVariables { id: &format!("{:?}", hash) },
    )
    .await?;

    println!("{:?}", res);

    Ok(())
}
