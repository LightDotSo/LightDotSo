#![allow(clippy::unwrap_used)]
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

use lightdotso_prisma::log;
use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbLog {
    pub log: ethers_main::types::Log,
    pub topics: Vec<ethers_main::types::H256>,
}

impl TryFrom<log::Data> for DbLog {
    type Error = eyre::Report;

    fn try_from(log: log::Data) -> Result<Self, Self::Error> {
        let topics = log.clone().topics.unwrap().into_iter().collect::<Vec<_>>();

        let log_topics = topics
            .into_iter()
            .map(|t| {
                // The topic is separated by a `-` and the first part is the log topic id
                let split = t.id.split('-').collect::<Vec<_>>();

                // Get the log topic id
                let log_topic_id = split[0];

                // Return the log topic
                log_topic_id.parse::<ethers_main::types::H256>().unwrap()
            })
            .collect::<Vec<ethers_main::types::H256>>();

        let log = ethers_main::types::Log {
            address: log.address.parse().unwrap(),
            topics: log_topics.clone(),
            data: log.data.into(),
            block_hash: log.block_hash.map(|bh| bh.parse().unwrap()),
            block_number: log.block_number.map(|bn| (bn as u64).into()),
            transaction_hash: log.transaction_hash.map(|th| th.parse().unwrap()),
            transaction_index: log.transaction_index.map(|ti| (ti as u64).into()),
            log_index: log.log_index.map(|li| (li as u64).into()),
            transaction_log_index: log.transaction_log_index.map(|lti| (lti as u64).into()),
            log_type: log.log_type,
            removed: log.removed,
        };

        Ok(Self { log: log.clone(), topics: log_topics })
    }
}
