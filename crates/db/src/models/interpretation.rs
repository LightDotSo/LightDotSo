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
use lightdotso_interpreter::types::InterpretationResponse;
use lightdotso_prisma::{interpretation, interpretation_action, transaction, user_operation};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new interpretation
#[autometrics]
pub async fn upsert_interpretation_with_actions(
    db: Database,
    res: InterpretationResponse,
    transaction_hash: String,
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
                .map(|token| (to_checksum(&token.address, None), res.chain_id as i64, vec![]))
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
                        serde_json::to_string(&action.action_type).unwrap(),
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
    let interpretation_actions = db
        .interpretation_action()
        .find_many(
            res.clone()
                .actions
                .into_iter()
                .map(|action| {
                    if action.address.is_some() {
                        interpretation_action::action_address(
                            serde_json::to_string(&action.action_type).unwrap(),
                            to_checksum(&action.address.unwrap(), None),
                        )
                    } else {
                        interpretation_action::action::equals(
                            serde_json::to_string(&action.action_type).unwrap(),
                        )
                    }
                })
                .collect(),
        )
        .exec()
        .await?;
    info!(?interpretation_actions);

    // Connect the interpretation to the transaction and user operation
    let mut interpretation_params = vec![
        interpretation::actions::set(
            interpretation_actions
                .into_iter()
                .map(|action| interpretation_action::id::equals(action.id))
                .collect::<Vec<_>>(),
        ),
        interpretation::transaction::connect(transaction::hash::equals(transaction_hash)),
    ];
    if let Some(user_operation_hash) = user_operation_hash {
        interpretation_params.push(interpretation::user_operation::connect(
            user_operation::hash::equals(user_operation_hash),
        ));
    };
    // Create the interpretation
    let interpretation = db.interpretation().create(interpretation_params).exec().await?;

    // Create all possible asset changes
    let asset_changes = db
        .asset_change()
        .create_many(
            res.clone()
                .asset_changes
                .into_iter()
                .map(|asset_change| {
                    (
                        to_checksum(&asset_change.address, None),
                        asset_change.amount.as_u64() as i64,
                        asset_change.before_amount.as_u64() as i64,
                        asset_change.after_amount.as_u64() as i64,
                        interpretation.clone().id,
                        vec![
                            // asset_change::token::add(to_checksum(&asset_change.token.address,
                            // None)),
                            //Get the corresponding
                            // interpretation action
                            // asset_change::action::set(
                            //     interpretation_actions
                            //         .iter()
                            //         .find(|action| {
                            //             action.action_type.eq(&asset_change.action.action_type) &&
                            //                 action.address.eq(&asset_change.address)
                            //         })
                            //         .unwrap()
                            //         .id,
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
