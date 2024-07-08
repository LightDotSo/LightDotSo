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

use eyre::{eyre, Result};
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

        // Parses and obtains the topic string and its index.
        let mut log_topic_ids = topics
            .into_iter()
            .map(|t| {
                let split = t.id.split('-').collect::<Vec<_>>();

                // Ensure there are enough parts
                if split.len() < 2 {
                    return Err(eyre!("Unexpected topic format. Expected '<id>-<index>'."));
                }

                // Parse the index
                let index =
                    split[1].parse::<usize>().map_err(|_| eyre!("Invalid number in topic id"))?;

                // Parse log_topic_id
                let log_topic_id = split[0]
                    .parse::<ethers_main::types::H256>()
                    .map_err(|_| eyre!("Error while parsing log topic"))?;

                Ok((index, log_topic_id))
            })
            .collect::<Result<Vec<(usize, ethers_main::types::H256)>>>()?;

        // Sorts topics by their indexes.
        log_topic_ids.sort_by_key(|(index, _)| *index);

        // If only the sorted log_topic_ids are needed, map again to remove the index.
        let log_topics = log_topic_ids
            .into_iter()
            .map(|(_, log_topic_id)| log_topic_id)
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
