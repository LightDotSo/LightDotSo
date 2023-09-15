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

pub fn run_query() -> cynic::GraphQlResponse<MyQuery> {
    use cynic::http::ReqwestBlockingExt;

    let query = build_query();

    reqwest::blocking::Client::new()
        .post("https://api.thegraph.com/subgraphs/name/lightdotso/mainnet")
        .run_graphql(query)
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

    #[test]
    fn test_running_query() {
        let result = run_query();
        if result.errors.is_some() {
            assert_eq!(result.errors.unwrap().len(), 0);
        }
        insta::assert_debug_snapshot!(result.data);
    }
}
