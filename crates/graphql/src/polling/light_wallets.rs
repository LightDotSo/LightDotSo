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
pub struct GetProtocolQueryVariables {
    pub min_block: BigInt,
}

#[derive(cynic::QueryFragment, Debug)]
#[cynic(graphql_type = "Query", variables = "GetProtocolQueryVariables")]
pub struct GetProtocolQuery {
    #[arguments(where: { blockNumber_gte: $min_block })]
    pub light_wallets: Vec<LightWallet>,
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
}

#[derive(cynic::QueryFragment, Debug)]
pub struct LightWallet {
    pub id: Bytes,
    pub index: BigInt,
    pub address: Bytes,
    pub image_hash: Option<Bytes>,
    pub user_op_hash: Bytes,
    pub sender: Bytes,
    pub factory: Bytes,
    pub paymaster: Bytes,
    pub block_number: BigInt,
    pub block_timestamp: BigInt,
    pub transaction_hash: Bytes,
}

#[derive(cynic::Scalar, Debug, Clone)]
pub struct BigInt(pub String);

#[derive(cynic::Scalar, Debug, Clone)]
pub struct Bytes(pub String);

pub fn run_query() -> cynic::GraphQlResponse<GetProtocolQuery> {
    use cynic::http::ReqwestBlockingExt;

    let query = build_query();

    reqwest::blocking::Client::new()
        .post("https://api.thegraph.com/subgraphs/name/lightdotso/mainnet")
        .run_graphql(query)
        .unwrap()
}

pub fn build_query() -> cynic::Operation<GetProtocolQuery, GetProtocolQueryVariables> {
    use cynic::QueryBuilder;

    GetProtocolQuery::build(GetProtocolQueryVariables { min_block: BigInt("0".to_string()) })
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
