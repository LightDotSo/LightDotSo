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

    // Create all possible tokens
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

    // Get the corresponding interpretation actions
    let mut interpration_action_params = vec![];
    let _ = res.clone().actions.into_iter().map(|action| {
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
                            asset_change::token::connect(
                                if let Some(token_id) = change.token.token_id {
                                    token::address_chain_id_token_id(
                                        to_checksum(&change.address, None),
                                        res.chain_id as i64,
                                        token_id.as_u64() as i64,
                                    )
                                } else {
                                    token::address_chain_id(
                                        to_checksum(&change.address, None),
                                        res.chain_id as i64,
                                    )
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
    info!(?asset_changes);

    Ok(interpretation)
}
