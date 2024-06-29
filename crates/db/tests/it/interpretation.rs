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

use ethers_main::types::Address;
use eyre::Result;
use lightdotso_db::{
    db::create_test_client, models::interpretation::upsert_interpretation_with_actions,
};
use lightdotso_interpreter::{
    constants::InterpretationActionType,
    types::{
        AssetChange, AssetToken, AssetTokenType, InterpretationAction, InterpretationResponse,
    },
};
use revm::interpreter::InstructionResult;
use std::sync::Arc;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_upsert_interpretation_with_actions() -> Result<()> {
    // Load the environment variables.
    let _ = dotenvy::dotenv();

    // Initialize the tracing subscriber.
    lightdotso_tracing::tracing_subscriber::fmt().init();

    // Create a database client.
    let db = create_test_client().await?;

    let resp = InterpretationResponse {
        gas_used: 0,
        chain_id: 1001,
        block_number: 1,
        success: true,
        traces: vec![],
        logs: vec![],
        exit_reason: InstructionResult::Stop,
        actions: vec![
            InterpretationAction {
                address: Some(Address::zero()),
                action_type: InterpretationActionType::ERC1155Burn,
            },
            InterpretationAction {
                address: Some(Address::zero()),
                action_type: InterpretationActionType::ERC1155Burn,
            },
            InterpretationAction {
                address: Some("0x6144d927ee371de7e7f8221b596f3432e7a8e6d9".parse().unwrap()),
                action_type: InterpretationActionType::ERC1155Mint,
            },
        ],
        asset_changes: vec![
            AssetChange {
                address: Address::zero(),
                before_amount: None,
                after_amount: None,
                amount: 0.into(),
                action: InterpretationAction {
                    address: Some(Address::zero()),
                    action_type: InterpretationActionType::ERC1155Burn,
                },
                token: AssetToken {
                    address: Address::zero(),
                    token_id: None,
                    token_type: AssetTokenType::Erc1155,
                },
            },
            AssetChange {
                address: Address::zero(),
                before_amount: Some(1.into()),
                after_amount: None,
                amount: 0.into(),
                action: InterpretationAction {
                    address: Some(Address::zero()),
                    action_type: InterpretationActionType::ERC1155Burn,
                },
                token: AssetToken {
                    address: "0x6144d927ee371de7e7f8221b596f3432e7a8e6d9".parse().unwrap(),
                    token_id: Some(1.into()),
                    token_type: AssetTokenType::Erc1155,
                },
            },
            AssetChange {
                address: Address::zero(),
                before_amount: Some(1.into()),
                after_amount: None,
                amount: 0.into(),
                action: InterpretationAction {
                    address: Some("0x6144d927ee371de7e7f8221b596f3432e7a8e6d9".parse().unwrap()),
                    action_type: InterpretationActionType::ERC1155Mint,
                },
                token: AssetToken {
                    address: "0x6144d927ee371de7e7f8221b596f3432e7a8e6d9".parse().unwrap(),
                    token_id: Some(1.into()),
                    token_type: AssetTokenType::Erc1155,
                },
            },
        ],
    };

    // Get a transaction with logs.
    let tx = upsert_interpretation_with_actions(Arc::new(db), resp, None, None).await?;

    // Print the transaction.
    println!("{:?}", tx);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_upsert_interpretation_with_actions_empty() -> Result<()> {
    // Load the environment variables.
    let _ = dotenvy::dotenv();

    // Initialize the tracing subscriber.
    lightdotso_tracing::tracing_subscriber::fmt().init();

    // Create a database client.
    let db = create_test_client().await?;

    let resp = InterpretationResponse {
        gas_used: 0,
        chain_id: 1001,
        block_number: 1,
        success: true,
        traces: vec![],
        logs: vec![],
        exit_reason: InstructionResult::Stop,
        actions: vec![],
        asset_changes: vec![],
    };

    // Get a transaction with logs.
    let tx = upsert_interpretation_with_actions(Arc::new(db), resp, None, None).await?;

    // Print the transaction.
    println!("{:?}", tx);

    Ok(())
}
