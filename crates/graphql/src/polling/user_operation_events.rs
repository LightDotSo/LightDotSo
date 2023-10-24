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

use crate::utils::get_graphql_url;
use eyre::Result;

#[cynic::schema("graph")]
mod schema {}

#[derive(cynic::QueryVariables, Debug)]
pub struct GetUserOperationsQueryVariables {
    pub min_block: BigInt,
    pub min_index: BigInt,
}

#[derive(cynic::QueryFragment, Debug)]
#[cynic(graphql_type = "Query", variables = "GetUserOperationsQueryVariables")]
pub struct GetUserOperationsQuery {
    #[arguments(first: 300, where: { blockNumber_gt: $min_block, index_gt: $min_index }, orderBy: "index")]
    pub user_operation_events: Vec<UserOperationEvent>,
}

#[derive(cynic::QueryFragment, Debug)]
pub struct UserOperationEvent {
    #[cynic(rename = "index")]
    pub id: BigInt,
    pub user_op_hash: Bytes,
    pub sender: Bytes,
    pub paymaster: Bytes,
    pub nonce: BigInt,
    pub transaction_hash: Bytes,
}

#[derive(cynic::Scalar, Debug, Clone)]
pub struct BigInt(pub String);

#[derive(cynic::Scalar, Debug, Clone)]
pub struct Bytes(pub String);

pub fn build_user_operations_query(
    vars: GetUserOperationsQueryVariables,
) -> cynic::Operation<GetUserOperationsQuery, GetUserOperationsQueryVariables> {
    use cynic::QueryBuilder;

    GetUserOperationsQuery::build(vars)
}

pub fn run_user_operations_query(
    chain_id: u64,
    vars: GetUserOperationsQueryVariables,
) -> Result<cynic::GraphQlResponse<GetUserOperationsQuery>> {
    use cynic::http::ReqwestBlockingExt;

    let query = build_user_operations_query(vars);

    Ok(reqwest::blocking::Client::new().post(get_graphql_url(chain_id)?).run_graphql(query)?)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn snapshot_test_query() {
        // Running a snapshot test of the query building functionality as that gives us
        // a place to copy and paste the actual GQL we're using for running elsewhere,
        // and also helps ensure we don't change queries by mistake

        let query = build_user_operations_query(GetUserOperationsQueryVariables {
            min_block: BigInt("0".to_string()),
            min_index: BigInt("0".to_string()),
        });

        insta::assert_snapshot!(query.query);
    }

    #[test]
    fn test_running_query() {
        let result = run_user_operations_query(
            137,
            GetUserOperationsQueryVariables {
                min_block: BigInt("0".to_string()),
                min_index: BigInt("0".to_string()),
            },
        )
        .unwrap();
        if result.errors.is_some() {
            assert_eq!(result.errors.unwrap().len(), 0);
        }
    }
}
