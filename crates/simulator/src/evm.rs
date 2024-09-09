// Copyright 2023-2024 LightDotSo.
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

// From: https://github.com/EnsoFinance/transaction-simulator/blob/64fe96afd52e5ff138ea0c22ad23aa4287346e7c/src/evm.rs
// License: MIT

use crate::types::CallRawResult;
use alloy::primitives::{Address, Bytes, Uint, U256};
use eyre::{eyre, Result};
use foundry_evm::{
    backend::Backend,
    executors::{Executor, ExecutorBuilder},
    fork::CreateFork,
    opts::EvmOpts,
    traces::TraceMode,
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
    ) -> Result<Self> {
        let evm_opts = EvmOpts {
            fork_url: Some(fork_url.clone()),
            fork_block_number,
            env: foundry_evm::opts::Env {
                chain_id: None,
                code_size_limit: None,
                gas_price: Some(0),
                gas_limit: u64::MAX,
                ..Default::default()
            },
            memory_limit: foundry_config::Config::default().memory_limit,
            ..Default::default()
        };

        let fork_env = evm_opts.fork_evm_env(fork_url.clone()).await?.0;

        let fork_opts = CreateFork { url: fork_url, enable_caching: true, env: fork_env, evm_opts };

        let db = Backend::spawn(Some(fork_opts.clone()));

        let builder = ExecutorBuilder::default()
            .gas_limit(gas_limit)
            .inspectors(|stack| stack.trace_mode(TraceMode::Debug));

        let executor = builder.build(env.unwrap_or(fork_opts.env.clone()), db);

        Ok(Evm { executor })
    }

    pub async fn call_raw(
        &mut self,
        from: Address,
        to: Address,
        value: Option<U256>,
        data: Option<Bytes>,
    ) -> Result<CallRawResult> {
        let res = self
            .executor
            .call_raw(from, to, data.unwrap_or_default(), value.unwrap_or_default())
            .map_err(|err| {
                dbg!(&err);
                eyre!(err)
            })?;

        Ok(CallRawResult {
            gas_used: res.gas_used,
            block_number: res.env.block.number.to(),
            success: !res.reverted,
            trace: res.traces.map(|trace| trace.arena),
            logs: res.logs,
            exit_reason: res.exit_reason,
            return_data: res.result,
        })
    }

    pub async fn call_raw_committing(
        &mut self,
        from: Address,
        to: Address,
        value: Option<U256>,
        data: Option<Bytes>,
        gas_limit: u64,
    ) -> Result<CallRawResult> {
        self.executor.set_gas_limit(gas_limit);
        let res = self
            .executor
            .transact_raw(from, to, data.unwrap_or_default(), value.unwrap_or_default())
            .map_err(|err| {
                dbg!(&err);
                eyre!(err)
            })?;

        Ok(CallRawResult {
            gas_used: res.gas_used,
            block_number: res.env.block.number.to(),
            success: !res.reverted,
            trace: res.traces.map(|trace| trace.arena),
            logs: res.logs,
            exit_reason: res.exit_reason,
            return_data: res.result,
        })
    }

    pub async fn get_balance(&self, address: Address) -> Result<U256> {
        let balance = self.executor.get_balance(address).map_err(|err| {
            dbg!(&err);
            eyre!(err)
        })?;

        Ok(balance)
    }

    pub async fn set_block(&mut self, number: u64) -> Result<()> {
        self.executor.env_mut().block.number = U256::from(number);
        Ok(())
    }

    pub fn get_block(&self) -> U256 {
        self.executor.env().block.number
    }

    pub async fn set_block_timestamp(&mut self, timestamp: u64) -> Result<()> {
        self.executor.env_mut().block.timestamp = Uint::from(timestamp);
        Ok(())
    }

    pub fn get_block_timestamp(&self) -> U256 {
        self.executor.env().block.timestamp
    }

    pub fn get_chain_id(&self) -> U256 {
        U256::from(self.executor.env().cfg.chain_id)
    }
}
