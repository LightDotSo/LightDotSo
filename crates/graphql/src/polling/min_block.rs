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
