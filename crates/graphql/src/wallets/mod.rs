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

#![allow(clippy::unwrap_used)]

#[cynic::schema("graph")]
mod schema {}

#[derive(cynic::QueryVariables, Debug)]
pub struct MyQueryVariables {
    pub n: i32,
}

#[derive(cynic::QueryFragment, Debug)]
#[cynic(graphql_type = "Query", variables = "MyQueryVariables")]
pub struct MyQuery {
    #[arguments(first: $n)]
    pub light_wallets: Vec<LightWallet>,
}

#[derive(cynic::QueryFragment, Debug)]
pub struct LightWallet {
    pub id: Bytes,
}

#[derive(cynic::Scalar, Debug, Clone)]
pub struct Bytes(pub String);

pub async fn run_query() -> cynic::GraphQlResponse<MyQuery> {
    use cynic::http::ReqwestExt;

    let query = build_query();

    reqwest::Client::new()
        .post("https://api.thegraph.com/subgraphs/name/lightdotso/mainnet")
        .run_graphql(query)
        .await
        .unwrap()
}

pub fn build_query() -> cynic::Operation<MyQuery, MyQueryVariables> {
    use cynic::QueryBuilder;

    MyQuery::build(MyQueryVariables { n: 10 })
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn snapshot_test_query() {
        // Running a snapshot test of the query building functionality as that gives us
        // a place to copy and paste the actual GQL we're using for running elsewhere,
        // and also helps ensure we don't change queries by mistake

        let query = build_query();

        insta::assert_snapshot!(query.query);
    }
}
