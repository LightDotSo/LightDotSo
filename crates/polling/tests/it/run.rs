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
use lightdotso_graphql::constants::{THE_GRAPH_STUDIO_BASE_URL, THE_GRAPH_STUDIO_SERVICE_IDS};
use lightdotso_polling::{config::PollingArgs, polling::Polling};
use lightdotso_tracing::init_test_tracing;
use std::collections::HashMap;

#[ignore]
#[tokio::test]
async fn test_polling_get_user_operation() {
    let _ = dotenv();

    init_test_tracing();

    let args = PollingArgs::default();
    let chain_mapping = HashMap::new();

    let polling = Polling::new(&args, HashMap::new(), chain_mapping, false).await.unwrap();

    let hash: B256 =
        "0x5c9ac218426e13b18f7260d73ce0ea2d86dd44e88886ef0265803829874ff140".parse().unwrap();
    let res = polling.get_user_operation_with_backon(10, hash).await;

    println!("{:?}", res);

    assert!(res.is_ok());
}

#[ignore]
#[tokio::test]
async fn test_polling_get_user_operation_v070() {
    let _ = dotenv();

    init_test_tracing();

    let args = PollingArgs::default();
    let chain_mapping = HashMap::new();

    let polling = Polling::new(&args, HashMap::new(), chain_mapping, false).await.unwrap();

    let hash: B256 =
        "0x083647d47403af3d375a7f6c8d2ba8d1781669b277951b359d780bbab3ff9a65".parse().unwrap();
    let res = polling.get_user_operation(56, hash).await;

    println!("{:?}", res);

    assert!(res.is_ok());
}

#[ignore]
#[tokio::test]
async fn test_polling_poll_uop() {
    let _ = dotenv();

    init_test_tracing();

    let args = PollingArgs::default();
    let chain_mapping = HashMap::new();

    let polling = Polling::new(&args, HashMap::new(), chain_mapping, false).await.unwrap();

    let id = THE_GRAPH_STUDIO_SERVICE_IDS.get(&137).unwrap();

    let url = format!(
        "{}/{}/{}/{}",
        THE_GRAPH_STUDIO_BASE_URL.clone(),
        std::env::var("THE_GRAPH_STUDIO_API_KEY").unwrap(),
        "subgraphs/id",
        id
    );

    let hash: B256 =
        "0x35bef2d3da16e9f4621a6e4852afcc939c64e949def198d4c542c4d9f3f0ee21".parse().unwrap();

    let res = polling.poll_uop(url, hash).await;

    println!("{:?}", res);

    assert!(res.is_ok());
}
