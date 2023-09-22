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

use ethers::{
    providers::{Http, Middleware, Provider},
    types::{Address, Chain},
};
use lightdotso_tracing::tracing::info;
use silius_grpc::uopool_service_run;
use std::{net::SocketAddr, sync::Arc};

use crate::{opts::UoPoolOpts, utils::unwrap_path_or_home};

pub async fn launch_uopool(
    opts: UoPoolOpts,
    chain_id: u64,
    eth_client_address: String,
    chain: Option<String>,
    entry_points: Vec<Address>,
) -> anyhow::Result<()> {
    info!("Starting uopool gRPC service...");

    let eth_client = Arc::new(Provider::<Http>::try_from(eth_client_address.clone())?);
    let eth_client_version = check_connected_chain(eth_client.clone(), chain).await?;
    info!(
        "UoPool connected to Ethereum execution client at {}: {}",
        eth_client_address, eth_client_version
    );

    let datadir = unwrap_path_or_home(None)?;

    uopool_service_run(
        SocketAddr::new(opts.uopool_addr, opts.uopool_port),
        datadir,
        entry_points,
        eth_client.clone(),
        Chain::from(chain_id),
        opts.max_verification_gas,
        opts.min_stake,
        opts.min_unstake_delay,
        opts.min_priority_fee_per_gas,
        opts.whitelist,
        opts.uopool_mode,
    )
    .await?;

    info!("Started uopool gRPC service at {:?}:{:?}", opts.uopool_addr, opts.uopool_port);

    Ok(())
}

async fn check_connected_chain(
    eth_client: Arc<Provider<Http>>,
    chain: Option<String>,
) -> anyhow::Result<String> {
    let chain_id = eth_client.get_chainid().await?;
    let chain_conn = Chain::from(chain_id);

    if let Some(chain_opt) = chain {
        if chain_conn.name() != chain_opt {
            return Err(anyhow::format_err!(
                "Tried to connect to the execution client of different chain: {} != {}",
                chain_opt,
                chain_conn.name()
            ));
        }
    }

    Ok(eth_client.client_version().await?)
}
