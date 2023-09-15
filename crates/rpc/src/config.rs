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

use clap::Parser;

#[derive(Debug, Clone, Parser, Default)]
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
    /// The nodereal API key
    #[clap(long, env = "NODEREAL_API_KEY")]
    pub nodereal_api_key: String,
}
