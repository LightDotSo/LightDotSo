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

#[cynic::schema("graph")]
mod schema {}

#[derive(cynic::QueryFragment, Debug)]
#[cynic(graphql_type = "Query")]
pub struct GetMinBlockQuery {
    pub _meta: Option<Meta>,
}

#[derive(cynic::QueryFragment, Debug)]
#[cynic(graphql_type = "_Meta_")]
pub struct Meta {
    pub block: Block,
}

#[derive(cynic::QueryFragment, Debug)]
#[cynic(graphql_type = "_Block_")]
pub struct Block {
    pub number: i32,
    pub timestamp: Option<i32>,
}

pub fn build_min_block_query() -> cynic::Operation<GetMinBlockQuery> {
    use cynic::QueryBuilder;

    GetMinBlockQuery::build(())
}

pub fn run_min_block_query(url: String) -> Result<cynic::GraphQlResponse<GetMinBlockQuery>> {
    use cynic::http::ReqwestBlockingExt;

    Ok(reqwest::blocking::Client::new().post(url).run_graphql(build_min_block_query())?)
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::utils::get_graphql_url;

    #[test]
    fn snapshot_test_query() {
        // Running a snapshot test of the query building functionality as that gives us
        // a place to copy and paste the actual GQL we're using for running elsewhere,
        // and also helps ensure we don't change queries by mistake

        let query = build_min_block_query();

        insta::assert_snapshot!(query.query);
    }

    #[test]
    fn test_running_query() {
        let result = run_min_block_query(get_graphql_url(1).unwrap()).unwrap();
        if result.errors.is_some() {
            assert_eq!(result.errors.unwrap().len(), 0);
        }
    }
}
