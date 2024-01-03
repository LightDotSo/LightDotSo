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

// From: https://github.com/EnsoFinance/transaction-simulator/blob/64fe96afd52e5ff138ea0c22ad23aa4287346e7c/src/evm.rs
// License: MIT

use crate::types::CallRawResult;
use ethers_main::{
    abi::{Address, Uint},
    types::Bytes,
};
use eyre::{eyre, Result};
use foundry_evm::{
    executor::{fork::CreateFork, opts::EvmOpts, Backend, Executor, ExecutorBuilder},
    trace::{identifier::SignaturesIdentifier, CallTraceDecoderBuilder},
};
use revm::primitives::Env;

pub struct Evm {
    executor: Executor,
}

impl Evm {
    pub async fn new(
        env: Option<Env>,
        fork_url: String,
        fork_block_number: Option<u64>,
        gas_limit: u64,
        tracing: bool,
    ) -> Self {
        let evm_opts = EvmOpts {
            fork_url: Some(fork_url.clone()),
            fork_block_number,
            env: foundry_evm::executor::opts::Env {
                chain_id: None,
                code_size_limit: None,
                gas_price: Some(0),
                gas_limit: u64::MAX,
                ..Default::default()
            },
            memory_limit: foundry_config::Config::default().memory_limit,
            ..Default::default()
        };

        let fork_opts = CreateFork {
            url: fork_url,
            enable_caching: true,
            env: evm_opts.local_evm_env(),
            evm_opts,
        };

        let db = Backend::spawn(Some(fork_opts.clone()));

        let mut builder =
            ExecutorBuilder::default().with_gas_limit(gas_limit.into()).set_tracing(tracing);

        if let Some(env) = env {
            builder = builder.with_config(env);
        } else {
            builder = builder.with_config(fork_opts.env.clone());
        }

        let executor = builder.build(db.await);

        let mut decoder = CallTraceDecoderBuilder::new().with_verbosity(5).build();

        if let Ok(identifier) =
            SignaturesIdentifier::new(foundry_config::Config::foundry_cache_dir(), false)
        {
            decoder.add_signature_identifier(identifier);
        }

        Evm { executor }
    }

    pub async fn call_raw(
        &mut self,
        from: Address,
        to: Address,
        value: Option<Uint>,
        data: Option<Bytes>,
    ) -> Result<CallRawResult> {
        let res = self
            .executor
            .call_raw(from, to, data.unwrap_or_default().0, value.unwrap_or_default())
            .map_err(|err| {
                dbg!(&err);
                eyre!(err)
            })?;

        Ok(CallRawResult {
            gas_used: res.gas_used,
            block_number: res.env.block.number.to(),
            success: !res.reverted,
            trace: res.traces,
            logs: res.logs,
            exit_reason: res.exit_reason,
            return_data: Bytes(res.result),
        })
    }

    pub async fn call_raw_committing(
        &mut self,
        from: Address,
        to: Address,
        value: Option<Uint>,
        data: Option<Bytes>,
        gas_limit: u64,
    ) -> Result<CallRawResult> {
        self.executor.set_gas_limit(gas_limit.into());
        let res = self
            .executor
            .call_raw_committing(from, to, data.unwrap_or_default().0, value.unwrap_or_default())
            .map_err(|err| {
                dbg!(&err);
                eyre!(err)
            })?;

        Ok(CallRawResult {
            gas_used: res.gas_used,
            block_number: res.env.block.number.to(),
            success: !res.reverted,
            trace: res.traces,
            logs: res.logs,
            exit_reason: res.exit_reason,
            return_data: Bytes(res.result),
        })
    }

    pub async fn get_balance(&self, address: Address) -> Result<Uint> {
        let balance = self.executor.get_balance(address).map_err(|err| {
            dbg!(&err);
            eyre!(err)
        })?;

        Ok(balance)
    }

    pub async fn set_block(&mut self, number: u64) -> Result<()> {
        self.executor.env_mut().block.number = Uint::from(number).into();
        Ok(())
    }

    pub fn get_block(&self) -> Uint {
        self.executor.env().block.number.into()
    }

    pub async fn set_block_timestamp(&mut self, timestamp: u64) -> Result<()> {
        self.executor.env_mut().block.timestamp = Uint::from(timestamp).into();
        Ok(())
    }

    pub fn get_block_timestamp(&self) -> Uint {
        self.executor.env().block.timestamp.into()
    }

    pub fn get_chain_id(&self) -> Uint {
        self.executor.env().cfg.chain_id.into()
    }
}
