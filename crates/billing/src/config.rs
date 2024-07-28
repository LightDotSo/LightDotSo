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

#![allow(clippy::unwrap_used)]

use crate::billing::Billing;
use clap::Parser;
use eyre::Result;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser, Default)]
pub struct BillingArgs {
    /// The flag of whether billing is live.
    #[arg(long, short, default_value_t = true)]
    #[clap(long, env = "BILLING_LIVE")]
    pub live: bool,
    /// The billing mode to connect to.
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "BILLING_MODE")]
    pub mode: String,
    /// The covalent API key
    #[clap(long, env = "COVALENT_API_KEY")]
    pub covalent_api_key: Option<String>,
}

impl BillingArgs {
    pub async fn create(&self) -> Result<Billing> {
        Billing::new(&BillingArgs::default()).await
    }

    #[tokio::main]
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("BillingArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        Ok(())
    }
}
