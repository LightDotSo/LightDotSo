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

#![allow(clippy::unwrap_used)]

use crate::types::Database;
use autometrics::autometrics;
use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_interpreter::types::{AssetTokenType, InterpretationResponse};
use lightdotso_prisma::{
    asset_change, interpretation, interpretation_action, token, transaction, user_operation,
    TokenType,
};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{and, or};

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

    // Create all possible tokens one by one
    let asset_change_param = res
        .clone()
        .asset_changes
        .into_iter()
        .map(|change| {
            (
                to_checksum(&change.token.address, None),
                res.chain_id as i64,
                vec![
                    token::token_id::set(change.token.token_id.map(|id| id.as_u64() as i64)),
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
    for asset_change in asset_change_param.clone() {
        // Fails gracefully if the token already exists
        let token = db.token().create(asset_change.0, asset_change.1, asset_change.2).exec().await;
        info!(?token);
    }

    // Create all possible interpretation actions in bulk
    let tokens = db
        .token()
        .create_many(
            res.clone()
                .asset_changes
                .into_iter()
                .map(|asset_change| {
                    (
                        to_checksum(&asset_change.token.address, None),
                        res.chain_id as i64,
                        vec![
                            token::token_id::set(
                                asset_change.token.token_id.map(|id| id.as_u64() as i64),
                            ),
                            token::r#type::set(
                                if asset_change.token.token_type == AssetTokenType::Erc20 {
                                    TokenType::Erc20
                                } else if asset_change.token.token_type == AssetTokenType::Erc721 {
                                    TokenType::Erc721
                                } else if asset_change.token.token_type == AssetTokenType::Erc1155 {
                                    TokenType::Erc1155
                                } else {
                                    TokenType::Erc1155
                                },
                            ),
                        ],
                    )
                })
                .collect::<Vec<_>>(),
        )
        .skip_duplicates()
        .exec()
        .await?;
    info!(?tokens);

    // Create all possible interpretation actions
    let actions = db
        .interpretation_action()
        .create_many(
            res.clone()
                .actions
                .into_iter()
                .map(|action| {
                    (
                        action.action_type.to_string(),
                        action
                            .address
                            .as_ref()
                            .map(|addr| {
                                interpretation_action::address::set(Some(to_checksum(addr, None)))
                            })
                            .into_iter()
                            .collect::<Vec<_>>(),
                    )
                })
                .collect::<Vec<_>>(),
        )
        .skip_duplicates()
        .exec()
        .await?;
    info!(?actions);

    // Get the corresponding tokens
    let mut token_params = vec![];
    res.clone().asset_changes.into_iter().for_each(|change| {
        if change.token.token_id.is_some() {
            token_params.push(token::address_chain_id_token_id(
                to_checksum(&change.token.address, None),
                res.chain_id as i64,
                change.token.token_id.unwrap().as_u64() as i64,
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
        if action.address.is_some() {
            interpration_action_params.push(and![
                interpretation_action::address::equals(Some(to_checksum(
                    &action.address.unwrap(),
                    None
                ))),
                interpretation_action::action::equals(action.action_type.to_string())
            ])
        } else {
            interpration_action_params
                .push(or![interpretation_action::action::equals(action.action_type.to_string())])
        }
    });
    // Find all the matching interpretation actions
    let interpretation_actions =
        db.interpretation_action().find_many(interpration_action_params).exec().await?;
    info!(?interpretation_actions);

    // Connect the interpretation to the transaction and user operation
    let mut interpretation_params = vec![];
    interpretation_params.push(interpretation::actions::connect(
        interpretation_actions
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
    let asset_changes = db
        .asset_change()
        .create_many(
            res.clone()
                .asset_changes
                .into_iter()
                .map(|change| {
                    (
                        to_checksum(&change.address, None),
                        change.amount.as_u64() as i64,
                        interpretation.clone().id,
                        vec![
                            asset_change::before_amount::set(
                                change.before_amount.map(|bm| bm.as_u64() as i64),
                            ),
                            asset_change::after_amount::set(
                                change.after_amount.map(|am| am.as_u64() as i64),
                            ),
                            // asset_change::interpretation_action::connect(
                            //     interpretation_action::id::equals(
                            //         interpretation_actions
                            //             .clone()
                            //             .into_iter()
                            //             .find(|action| {
                            //                 action.action ==
                            // change.action.action_type.to_string()
                            //             })
                            //             .unwrap()
                            //             .id,
                            //     ),
                            // ),
                            // asset_change::token::connect(
                            //     // Find the corresponding token
                            //     token::id::equals(
                            //         asset_tokens
                            //             .clone()
                            //             .into_iter()
                            //             .find(|token| {
                            //                 token.chain_id == res.chain_id as i64 &&
                            //                     token.address ==
                            //                         to_checksum(&change.token.address, None) &&
                            //                     token.token_id ==
                            //                         change
                            //                             .token
                            //                             .token_id
                            //                             .map(|id| id.as_u64() as i64)
                            //             })
                            //             .unwrap()
                            //             .id,
                            //     ),
                            // ),
                        ],
                    )
                })
                .collect::<Vec<_>>(),
        )
        .skip_duplicates()
        .exec()
        .await?;
    info!(?asset_changes);

    Ok(interpretation)
}
