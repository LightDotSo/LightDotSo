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
use lightdotso_prisma::{interpretation, interpretation_action};
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------

/// Create a new interpretation
#[autometrics]
pub async fn upsert_interpretation_with_actions(
    db: Database,
    res: InterpretationResponse,
) -> Result<interpretation::Data> {
    info!("Creating new interpretation");

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

    let interpretation_actions = db
        .interpretation_action()
        .find_many(
            res.actions
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

    let interpretation = db
        .interpretation()
        .create(vec![interpretation::actions::set(
            interpretation_actions
                .into_iter()
                .map(|action| interpretation_action::id::equals(action.id))
                .collect::<Vec<_>>(),
        )])
        .exec()
        .await?;

    Ok(interpretation)
}
