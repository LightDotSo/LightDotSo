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

use eyre::Result;
use lightdotso_db::{
    db::create_test_client, models::interpretation::upsert_interpretation_with_actions,
};
use lightdotso_interpreter::types::InterpretationResponse;
use revm::interpreter::InstructionResult;
use std::sync::Arc;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_upsert_interpretation_with_actions() -> Result<()> {
    // Load the environment variables.
    let _ = dotenvy::dotenv();

    // Create a database client.
    let db = create_test_client().await?;

    let req = InterpretationResponse {
        gas_used: 0,
        chain_id: 1,
        block_number: 1,
        success: true,
        traces: vec![],
        logs: vec![],
        exit_reason: InstructionResult::Stop,
        actions: vec![],
        asset_changes: vec![],
    };

    // Get a transaction with logs.
    let tx = upsert_interpretation_with_actions(Arc::new(db), req, None, None).await?;

    // Print the transaction.
    println!("{:?}", tx);

    Ok(())
}
