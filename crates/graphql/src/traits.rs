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

use crate::polling::user_operations::UserOperation;
use ethers::types::{Bloom, Log, OtherFields, Transaction, TransactionReceipt};
use lightdotso_common::traits::HexToBytes;
use lightdotso_contracts::types::UserOperationWithTransactionAndReceiptLogs;

#[derive(Clone, Debug)]
pub struct UserOperationConstruct {
    pub user_operation: UserOperation,
    pub chain_id: i64,
}

// Implement From<UserOperationConstruct> for User operation.
impl From<UserOperationConstruct> for UserOperationWithTransactionAndReceiptLogs {
    fn from(op: UserOperationConstruct) -> Self {
        Self {
            chain_id: op.chain_id,
            hash: op.user_operation.id.0.parse().unwrap(),
            entry_point: op.user_operation.entry_point.0.parse().unwrap(),
            sender: op.user_operation.sender.0.parse().unwrap(),
            nonce: (op.user_operation.nonce.0.parse::<u64>().unwrap()).into(),
            init_code: op.user_operation.init_code.clone().0.hex_to_bytes().unwrap().into(),
            call_data: op.user_operation.call_data.clone().0.hex_to_bytes().unwrap().into(),
            call_gas_limit: (op.user_operation.call_gas_limit.0.parse::<u64>().unwrap()).into(),
            verification_gas_limit: (op
                .user_operation
                .verification_gas_limit
                .0
                .parse::<u64>()
                .unwrap())
            .into(),
            pre_verification_gas: (op
                .user_operation
                .pre_verification_gas
                .0
                .parse::<u64>()
                .unwrap())
            .into(),
            max_fee_per_gas: (op.user_operation.max_fee_per_gas.0.parse::<u64>().unwrap()).into(),
            max_priority_fee_per_gas: (op
                .user_operation
                .max_priority_fee_per_gas
                .0
                .parse::<u64>()
                .unwrap())
            .into(),
            paymaster_and_data: op
                .user_operation
                .paymaster_and_data
                .clone()
                .0
                .hex_to_bytes()
                .unwrap()
                .into(),
            signature: op.user_operation.signature.clone().0.hex_to_bytes().unwrap().into(),
            logs: op.user_operation.logs.map_or(Vec::new(), |logs| {
                logs.into_iter()
                    .map(|log| Log {
                        address: log.address.0.parse().unwrap(),
                        topics: log
                            .topics
                            .unwrap()
                            .into_iter()
                            .map(|t| t.0.parse().unwrap())
                            .collect(),
                        data: log.data.0.hex_to_bytes().unwrap().into(),
                        block_hash: None,
                        block_number: None,
                        transaction_hash: None,
                        transaction_index: None,
                        log_index: None,
                        transaction_log_index: None,
                        log_type: None,
                        removed: None,
                    })
                    .collect()
            }),
            transaction: Transaction {
                hash: op.user_operation.transaction.hash.unwrap().0.parse().unwrap(),
                // Determistic Option Zero
                nonce: 0.into(),
                // Determistic Option None
                block_hash: None,
                block_number: Some(op.user_operation.block_number.0.parse().unwrap()),
                // Determistic Option None
                transaction_index: None,
                from: op.user_operation.transaction.from.0.parse().unwrap(),
                to: Some(op.user_operation.transaction.to.unwrap().0.parse().unwrap()),
                // Determistic Option Zero
                value: 0.into(),
                // Determistic Option None
                gas_price: None,
                // Determistic Option Zero
                gas: 0.into(),
                input: op
                    .user_operation
                    .transaction
                    .input
                    .unwrap()
                    .0
                    .hex_to_bytes()
                    .unwrap()
                    .into(),
                // Determistic Option Zero
                v: 0.into(),
                // Determistic Option Zero
                r: 0.into(),
                // Determistic Option Zero
                s: 0.into(),
                // Determistic Option None
                transaction_type: None,
                // Determistic Option None
                access_list: None,
                // Determistic Option None
                max_priority_fee_per_gas: None,
                // Determistic Option None
                max_fee_per_gas: None,
                chain_id: Some(op.chain_id.into()),
                // Determistic Option Default
                other: OtherFields::default(),
            },
            transaction_logs: op.user_operation.transaction.receipt.clone().unwrap().logs.map_or(
                Vec::new(),
                |logs| {
                    logs.into_iter()
                        .map(|log| Log {
                            address: log.address.0.parse().unwrap(),
                            topics: log
                                .topics
                                .unwrap()
                                .into_iter()
                                .map(|t| t.0.parse().unwrap())
                                .collect(),
                            data: log.data.0.hex_to_bytes().unwrap().into(),
                            block_hash: None,
                            block_number: None,
                            transaction_hash: None,
                            transaction_index: None,
                            log_index: None,
                            transaction_log_index: None,
                            log_type: None,
                            removed: None,
                        })
                        .collect()
                },
            ),
            receipt: TransactionReceipt {
                transaction_hash: op
                    .user_operation
                    .transaction
                    .receipt
                    .clone()
                    .unwrap()
                    .id
                    .0
                    .parse()
                    .unwrap(),
                transaction_index: op.user_operation.transaction.index.unwrap().0.parse().unwrap(),
                // Determistic Option None
                block_hash: None,
                // Determistic Option None
                block_number: None,
                // Determistic Option Zero
                cumulative_gas_used: 0.into(),
                // Determistic Option None
                gas_used: None,
                // Determistic Option None
                contract_address: None,
                logs: vec![],
                // Determistic Option None
                status: None,
                // Determistic Option Default
                logs_bloom: Bloom::default(),
                // Determistic Option None
                root: None,
                from: op.user_operation.transaction.from.0.parse().unwrap(),
                // Determistic Option None
                to: None,
                // Determistic Option None
                transaction_type: None,
                // Determistic Option None
                effective_gas_price: None,
                // Determistic Option Default
                other: OtherFields::default(),
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::polling::user_operations::{
        BigInt, Bytes, LightWallet, Log, Receipt, Transaction, UserOperation, UserOperationEvent,
    };

    #[test]
    fn test_user_operation_construct() {
        let user_operation = UserOperation {
          id: Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
          index: BigInt("1".to_string()),
          sender: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
          nonce: BigInt("0".to_string()),
          init_code: Bytes("0x0000000000756d3e6464f5efe7e413a0af1c7474183815c8b7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed60000000000000000000000000000000000000000000000000000000000000001".to_string()),
          call_data: Bytes("0x".to_string()),
          call_gas_limit: BigInt("5000000".to_string()),
          verification_gas_limit: BigInt("5000000".to_string()),
          pre_verification_gas: BigInt("50000".to_string()),
          max_fee_per_gas: BigInt("287500010".to_string()),
          max_priority_fee_per_gas: BigInt("287500010".to_string()),
          paymaster_and_data: Bytes("0x000000000018d32df916ff115a25fbefc70baf8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006517bc953e0624bf37d995fbcab5ccab2dc2589bcfc6bac1581d161a135ce749e1099fe032c83e21360fa516bdd13cb080e4090b924ce7a06459d837ee3556037ea21e381c".to_string()),
          signature: Bytes("0x0001000000010001783610798879fb9af654e2a99929e00e82c3a0f4288c08bc30266b64dc3e23285d634f6658fdeeb5ba9193b5e935a42a1d9bdf5007144707c9082e6eda5d8fbd1b01".to_string()),
          block_number: BigInt("4393588".to_string()),
          block_timestamp: BigInt("1696054440".to_string()),
          transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
          entry_point: Bytes("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string()),
          user_operation_event: Some(
            UserOperationEvent {
              id: Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
              index: BigInt("2".to_string()),
              user_op_hash: Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
              paymaster: Bytes("0x000000000018d32df916ff115a25fbefc70baf8b".to_string()),
              nonce: BigInt("0".to_string()),
              transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string())
            }),
          user_operation_revert_reason: None,
          light_wallet:
            LightWallet {
              id: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
              index: BigInt("1".to_string()),
              address: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
              image_hash: Some(Bytes("0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6".to_string())),
              user_op_hash: Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
              sender: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
              factory: Bytes("0x0000000000756d3e6464f5efe7e413a0af1c7474".to_string()),
              paymaster: Bytes("0x000000000018d32df916ff115a25fbefc70baf8b".to_string()),
              block_number: BigInt("4393588".to_string()),
              block_timestamp: BigInt("1696054440".to_string()),
              transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string())
            },
          transaction:
            Transaction {
              id: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
              hash: Some(Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string())),
              index: Some(BigInt("38".to_string())),
              from: Bytes("0xd53eb5203e367bbdd4f72338938224881fc501ab".to_string()),
              to: Some(Bytes("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string())),
              value: Some(BigInt("0".to_string())),
              gas_limit: Some(BigInt("21057750".to_string())),
              gas_price: Some(BigInt("30".to_string())),
              input: Some(Bytes("0x1fad948c0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000d53eb5203e367bbdd4f72338938224881fc501ab0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000010dbbe70128929723c1b982e53c51653232e4ff20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000004c4b4000000000000000000000000000000000000000000000000000000000004c4b40000000000000000000000000000000000000000000000000000000000000c350000000000000000000000000000000000000000000000000000000001122e6ea000000000000000000000000000000000000000000000000000000001122e6ea000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000000580000000000756d3e6464f5efe7e413a0af1c7474183815c8b7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed60000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000095000000000018d32df916ff115a25fbefc70baf8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006517bc953e0624bf37d995fbcab5ccab2dc2589bcfc6bac1581d161a135ce749e1099fe032c83e21360fa516bdd13cb080e4090b924ce7a06459d837ee3556037ea21e381c0000000000000000000000000000000000000000000000000000000000000000000000000000000000004a0001000000010001783610798879fb9af654e2a99929e00e82c3a0f4288c08bc30266b64dc3e23285d634f6658fdeeb5ba9193b5e935a42a1d9bdf5007144707c9082e6eda5d8fbd1b0100000000000000000000000000000000000000000000".to_string())),
              nonce: Some(BigInt("1238".to_string())),
              receipt: Some(
                Receipt {
                  id: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                  transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                  transaction_index: BigInt("38".to_string()),
                  block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                  block_number: BigInt("4393588".to_string()),
                  cumulative_gas_used: BigInt("3745264".to_string()),
                  gas_used: BigInt("411440".to_string()),
                  status: BigInt("1".to_string()),
                  logs_bloom: Bytes("0x0000060000000000000000000000000040000000000000000000000000000000000800000000000000020001000000000010004000000000000002000000000000000000000000004000000010000200004040000000000000000000400000000000000008200000000000000020000000000000000000400080000000000000000000000000004000000000000000000800020000048088000000000000000000000100010000000240000000040000000000000000000000a002000000000000000020000000000001000000040000000800000000020000000000000000000000001000000000000000000000000000000000000000000000000000400000".to_string()),
                  logs: Some(
                    [
                      Log {
                        id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-0".to_string().into(),
                        address: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
                        topics: Some(
                          [
                            Bytes("0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b".to_string()),
                            Bytes("0x0000000000000000000000008fb3cfdf2082c2be7d3205d361067748ea1abf63".to_string())
                          ].to_vec()
                        ),
                        data: Bytes("0x".to_string()),
                        block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                        block_number: Bytes("0x740a43".to_string()),
                        transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                        transaction_index: BigInt("38".to_string()),
                        log_index: BigInt("54".to_string())
                      },
                      Log {
                          id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-1".to_string().into(),
                          address: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
                          topics: Some(
                            [
                              Bytes("0x307ed6bd941ee9fc80f369c94af5fa11e25bab5102a6140191756c5474a30bfa".to_string())
                            ].to_vec()
                          ),
                          data: Bytes("0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6".to_string()),
                          block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                          block_number: Bytes("0x740a43".to_string()),
                          transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                          transaction_index: BigInt("38".to_string()),
                          log_index: BigInt("55".to_string())
                      },
                      Log {
                        id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-2".to_string().into(),
                        address: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
                        topics: Some(
                          [
                            Bytes("0x6f2a6aac3f1c9fc5bb4eec9d305f0036888047b27e7ca599572afe083d9879e8".to_string()),
                            Bytes("0x0000000000000000000000005ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string()),
                            Bytes("0xb7f285c774a1c925209bebaab24662b22e7cf32e2f7a412bfcb1bf52294b9ed6".to_string())
                          ].to_vec()
                        ),
                        data: Bytes("0x".to_string()),
                        block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                        block_number: Bytes("0x740a43".to_string()),
                        transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                        transaction_index: BigInt("38".to_string()),
                        log_index: BigInt("56".to_string())
                      },
                      Log {
                        id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-3".to_string().into(),
                        address: Bytes("0x10dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
                        topics: Some(
                          [
                            Bytes("0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498".to_string())
                          ].to_vec()
                        ),
                        data: Bytes("0x0000000000000000000000000000000000000000000000000000000000000001".to_string()),
                        block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                        block_number: Bytes("0x740a43".to_string()),
                        transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                        transaction_index: BigInt("38".to_string()),
                        log_index: BigInt("57".to_string())
                      },
                      Log {
                        id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-4".to_string().into(),
                        address: Bytes("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string()),
                        topics: Some(
                          [
                            Bytes("0xd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d".to_string()),
                            Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
                            Bytes("0x00000000000000000000000010dbbe70128929723c1b982e53c51653232e4ff2".to_string())
                          ].to_vec()
                        ),
                        data: Bytes("0x0000000000000000000000000000000000756d3e6464f5efe7e413a0af1c7474000000000000000000000000000000000018d32df916ff115a25fbefc70baf8b".to_string()),
                        block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                        block_number: Bytes("0x740a43".to_string()),
                        transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                        transaction_index: BigInt("38".to_string()),
                        log_index: BigInt("58".to_string())
                      },
                      Log {
                        id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-5".to_string().into(),
                        address: Bytes("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string()),
                        topics: Some(
                          [
                            Bytes("0xbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972".to_string())
                          ].to_vec()
                        ),
                        data: Bytes("0x".to_string()),
                        block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                        block_number: Bytes("0x740a43".to_string()),
                        transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                        transaction_index: BigInt("38".to_string()),
                        log_index: BigInt("59".to_string())
                      },
                      Log {
                        id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-6".to_string().into(),
                        address: Bytes("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string()),
                        topics: Some(
                          [
                            Bytes("0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f".to_string()),
                            Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
                            Bytes("0x00000000000000000000000010dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
                            Bytes("0x000000000000000000000000000000000018d32df916ff115a25fbefc70baf8b".to_string())
                          ].to_vec()
                        ),
                        data: Bytes("0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000006c2bead3b6840000000000000000000000000000000000000000000000000000000000064ffa".to_string()),
                        block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
                        block_number: Bytes("0x740a43".to_string()),
                        transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
                        transaction_index: BigInt("38".to_string()),
                        log_index: BigInt("60".to_string())
                      }
                    ].to_vec()
                  )
                }
              )
            },
          logs: Some(
            [
              Log {
                id: "0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf-6".to_string().into(),
                address: Bytes("0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789".to_string()),
                topics: Some(
                  [
                    Bytes("0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f".to_string()),
                    Bytes("0x1a8d7c5989225f7ef86fd7844c64b74e04d361734664fa6d2bf307414327875a".to_string()),
                    Bytes("0x00000000000000000000000010dbbe70128929723c1b982e53c51653232e4ff2".to_string()),
                    Bytes("0x000000000000000000000000000000000018d32df916ff115a25fbefc70baf8b".to_string())
                  ].to_vec()
              ),
              data: Bytes("0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000006c2bead3b6840000000000000000000000000000000000000000000000000000000000064ffa".to_string()),
              block_hash: Bytes("0x39e80c7a710d354971fe1f1bee0bb05714757741b674170076e842bbc610e63d".to_string()),
              block_number: Bytes("0x740a43".to_string()),
              transaction_hash: Bytes("0x87efb66c2b17af424b7fd2584d268eb1c301b9337eaad3137be5c4c7bbd574bf".to_string()),
              transaction_index: BigInt("38".to_string()),
              log_index: BigInt("60".to_string())}
            ].to_vec()
        )
      };

        let user_operation_construct =
            super::UserOperationConstruct { user_operation, chain_id: 1 };

        println!("{:?}", user_operation_construct);

        let user_operation_with_transaction_and_receipt_logs: super::UserOperationWithTransactionAndReceiptLogs =
            user_operation_construct.into();

        println!("{:?}", user_operation_with_transaction_and_receipt_logs);

        assert_eq!(user_operation_with_transaction_and_receipt_logs.chain_id, 1);
        assert_eq!(user_operation_with_transaction_and_receipt_logs.call_gas_limit, 5000000.into());
    }
}
