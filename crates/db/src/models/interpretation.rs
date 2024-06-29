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

#![allow(clippy::unwrap_used)]

use crate::types::Database;
use autometrics::autometrics;
use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_interpreter::types::{AssetTokenType, InterpretationResponse};
use lightdotso_prisma::{
    asset_change, chain, interpretation, interpretation_action, token, transaction, user_operation,
    TokenType,
};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new interpretation
#[allow(clippy::if_same_then_else)]
#[autometrics]
pub async fn upsert_interpretation_with_actions(
    db: Database,
    res: InterpretationResponse,
    transaction_hash: Option<String>,
    user_operation_hash: Option<String>,
) -> Result<interpretation::Data> {
    info!("Creating new interpretation");

    info!(?res);

    // Create all possible tokens one by one
    let asset_change_params = res
        .clone()
        .asset_changes
        .into_iter()
        .map(|change| {
            (
                to_checksum(&change.token.address, None),
                res.chain_id as i64,
                vec![
                    token::token_id::set(change.token.token_id.map(|id| id.low_u64() as i64)),
                    token::r#type::set(if change.token.token_type == AssetTokenType::Erc20 {
                        TokenType::Erc20
                    } else if change.token.token_type == AssetTokenType::Erc721 {
                        TokenType::Erc721
                    } else if change.token.token_type == AssetTokenType::Erc1155 {
                        TokenType::Erc1155
                    } else {
                        TokenType::Erc1155
                    }),
                ],
            )
        })
        .collect::<Vec<_>>();
    for asset_change_param in asset_change_params.clone() {
        // Fails gracefully if the token already exists
        let token_creation = db
            .token()
            .create(
                asset_change_param.0,
                chain::id::equals(asset_change_param.1),
                asset_change_param.2,
            )
            .exec()
            .await;
        info!(?token_creation);
    }

    // Create all possible interpretation actions in bulk
    let token_count = db.token().create_many(asset_change_params).skip_duplicates().exec().await?;
    info!(?token_count);

    // Create all possible interpretation actions
    let interpretation_actions_params = res
        .clone()
        .actions
        .into_iter()
        .map(|action| {
            (
                action.action_type.to_string(),
                if action.address.is_some() {
                    to_checksum(&action.address.unwrap(), None)
                } else {
                    "".to_string()
                },
                vec![],
            )
        })
        .collect::<Vec<_>>();
    for interpretation_action_param in interpretation_actions_params.clone() {
        // Fails gracefully if the interpretation action already exists
        let interpretation_action_creation = db
            .interpretation_action()
            .create(interpretation_action_param.0, interpretation_action_param.1, vec![])
            .exec()
            .await;
        info!(?interpretation_action_creation);
    }

    // Create all possible interpretation actions in bulk
    let interpretation_action_count = db
        .interpretation_action()
        .create_many(interpretation_actions_params)
        .skip_duplicates()
        .exec()
        .await?;
    info!(?interpretation_action_count);

    // Get the corresponding tokens
    let mut token_params = vec![];
    res.clone().asset_changes.into_iter().for_each(|change| {
        if change.token.token_id.is_some() {
            token_params.push(token::address_chain_id_token_id(
                to_checksum(&change.token.address, None),
                res.chain_id as i64,
                change.token.token_id.unwrap().low_u64() as i64,
            ))
        } else {
            token_params.push(token::address_chain_id(
                to_checksum(&change.token.address, None),
                res.chain_id as i64,
            ))
        }
    });
    let mut asset_tokens = vec![];
    // Find all the matching tokens
    for token_param in token_params {
        let asset_token = db.token().find_unique(token_param).exec().await?;
        // Push the token to the list of asset tokens if not None
        if let Some(asset_token) = asset_token {
            asset_tokens.push(asset_token);
        }
    }
    info!(?asset_tokens);

    // Get the corresponding interpretation actions
    let mut interpration_action_params = vec![];
    res.clone().actions.into_iter().for_each(|action| {
        interpration_action_params.push(interpretation_action::action_address(
            action.action_type.to_string(),
            if action.address.is_some() {
                to_checksum(&action.address.unwrap(), None)
            } else {
                "".to_string()
            },
        ))
    });
    // Find all the matching interpretation actions
    let mut interpretation_actions = vec![];
    for interpration_action_param in interpration_action_params {
        let interpretation_action =
            db.interpretation_action().find_unique(interpration_action_param).exec().await?;
        info!(?interpretation_action);
        // Push the interpretation action to the list of interpretation actions if not None
        if let Some(interpretation_action) = interpretation_action {
            interpretation_actions.push(interpretation_action);
        }
    }
    info!(?interpretation_actions);

    // Connect the interpretation to the transaction and user operation
    let mut interpretation_params = vec![];
    interpretation_params.push(interpretation::actions::connect(
        interpretation_actions
            .clone()
            .into_iter()
            .map(|action| interpretation_action::id::equals(action.id))
            .collect::<Vec<_>>(),
    ));
    if let Some(transaction_hash) = transaction_hash {
        interpretation_params.push(interpretation::transaction::connect(
            transaction::hash::equals(transaction_hash),
        ));
    };
    if let Some(user_operation_hash) = user_operation_hash {
        interpretation_params.push(interpretation::user_operation::connect(
            user_operation::hash::equals(user_operation_hash),
        ));
    };
    // Create the interpretation
    let interpretation = db.interpretation().create(interpretation_params).exec().await?;
    info!(?interpretation);

    // Create all possible asset changes
    let asset_change_params = res
        .clone()
        .asset_changes
        .into_iter()
        .map(|change| {
            (
                to_checksum(&change.address, None),
                format!("{}", change.amount),
                interpretation::id::equals(interpretation.clone().id),
                vec![
                    asset_change::before_amount::set(
                        change.before_amount.map(|bm| format!("{}", bm)),
                    ),
                    asset_change::after_amount::set(
                        change.after_amount.map(|am| format!("{}", am)),
                    ),
                    asset_change::interpretation_action::connect(
                        interpretation_action::id::equals(
                            // Find the corresponding interpretation action
                            interpretation_actions
                                .clone()
                                .into_iter()
                                .find(|action| {
                                    action.action == change.action.action_type.to_string() &&
                                        action.address ==
                                            if change.action.address.is_some() {
                                                to_checksum(&change.action.address.unwrap(), None)
                                            } else {
                                                "".to_string()
                                            }
                                })
                                .unwrap()
                                .id,
                        ),
                    ),
                    asset_change::token::connect(
                        // Find the corresponding token
                        token::id::equals(
                            asset_tokens
                                .clone()
                                .into_iter()
                                .find(|token| {
                                    token.chain_id == res.chain_id as i64 &&
                                        token.address == to_checksum(&change.token.address, None) &&
                                        token.token_id ==
                                            change
                                                .token
                                                .token_id
                                                .map(|id| id.low_u64() as i64)
                                })
                                .unwrap()
                                .id,
                        ),
                    ),
                ],
            )
        })
        .collect::<Vec<_>>();
    for asset_change_param in asset_change_params.clone() {
        // Fails gracefully if the asset change already exists
        let asset_change = db
            .asset_change()
            .create(
                asset_change_param.0,
                asset_change_param.1,
                asset_change_param.2,
                asset_change_param.3,
            )
            .exec()
            .await;
        info!(?asset_change);
    }

    Ok(interpretation)
}
