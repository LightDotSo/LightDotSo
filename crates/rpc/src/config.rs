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

use clap::Parser;

#[derive(Clone, Debug, Parser, Default)]
pub struct RpcArgs {
    /// The infura API key
    #[clap(long, env = "INFURA_API_KEY")]
    pub infura_api_key: String,
    /// The alchemy API key
    #[clap(long, env = "ALCHEMY_API_KEY")]
    pub alchemy_api_key: String,
    /// The chainnodes API key
    #[clap(long, env = "CHAINNODES_API_KEY")]
    pub chainnodes_api_key: String,
    /// The blastapi API key
    #[clap(long, env = "BLAST_API_KEY")]
    pub blast_api_key: String,
    /// The pilmico API key
    #[clap(long, env = "PIMLICO_API_KEY")]
    pub pimlico_api_key: String,
    /// The nodereal API key
    #[clap(long, env = "NODEREAL_API_KEY")]
    pub nodereal_api_key: String,
    /// The etherspot API key
    #[clap(long, env = "ETHERSPOT_API_KEY")]
    pub etherspot_api_key: String,
    /// The biconomy API key
    #[clap(long, env = "BICONOMY_API_KEY")]
    pub biconomy_api_key: String,
}
