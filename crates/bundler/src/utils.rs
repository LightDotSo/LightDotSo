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

use dirs::home_dir;
use ethers::types::{Address, U256};
use expanded_pathbuf::ExpandedPathBuf;
use lightdotso_tracing::tracing::info;
use pin_utils::pin_mut;
use silius_primitives::{bundler::SendBundleMode, UoPoolMode};
use std::{future::Future, str::FromStr};

/// Unwrap path or returns home directory
pub fn unwrap_path_or_home(path: Option<ExpandedPathBuf>) -> anyhow::Result<ExpandedPathBuf> {
    if let Some(path) = path {
        Ok(path)
    } else {
        home_dir()
            .map(|h| h.join(".silius"))
            .ok_or_else(|| anyhow::anyhow!("Get Home directory error"))
            .map(ExpandedPathBuf)
    }
}

/// Parses address from string
pub fn parse_address(s: &str) -> Result<Address, String> {
    Address::from_str(s).map_err(|_| format!("String {s} is not a valid address"))
}

/// Parses U256 from string
pub fn parse_u256(s: &str) -> Result<U256, String> {
    U256::from_str_radix(s, 10).map_err(|_| format!("String {s} is not a valid U256"))
}

/// Parses SendBundleMode from string
pub fn parse_send_bundle_mode(s: &str) -> Result<SendBundleMode, String> {
    SendBundleMode::from_str(s).map_err(|_| format!("String {s} is not a valid SendBundleMode"))
}

/// Parses UoPoolMode from string
pub fn parse_uopool_mode(s: &str) -> Result<UoPoolMode, String> {
    UoPoolMode::from_str(s).map_err(|_| format!("String {s} is not a valid UoPoolMode"))
}

/// Runs the future to completion or until:
/// - `ctrl-c` is received.
/// - `SIGTERM` is received (unix only).
pub async fn run_until_ctrl_c<F, E>(fut: F) -> Result<(), E>
where
    F: Future<Output = Result<(), E>>,
    E: Send + Sync + 'static + From<std::io::Error>,
{
    let ctrl_c = tokio::signal::ctrl_c();

    let mut stream = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())?;
    let sigterm = stream.recv();
    pin_mut!(sigterm, ctrl_c, fut);

    tokio::select! {
        _ = ctrl_c => {
            info!("Received ctrl-c signal.");
        },
        _ = sigterm => {
            info!("Received SIGTERM signal.");
        },
        res = fut => res?,
    }

    Ok(())
}
