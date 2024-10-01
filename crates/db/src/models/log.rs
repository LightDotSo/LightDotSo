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

use alloy::{
    primitives::{Log as AlloyLog, B256},
    rpc::types::Log,
};
use eyre::{eyre, Result};
use lightdotso_prisma::log;
use revm::primitives::LogData;
use serde::{Deserialize, Serialize};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DbLog {
    pub log: Log,
    pub topics: Vec<B256>,
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
                let log_topic_id =
                    split[0].parse::<B256>().map_err(|_| eyre!("Error while parsing log topic"))?;

                Ok((index, log_topic_id))
            })
            .collect::<Result<Vec<(usize, B256)>>>()?;

        // Sorts topics by their indexes.
        log_topic_ids.sort_by_key(|(index, _)| *index);

        // If only the sorted log_topic_ids are needed, map again to remove the index.
        let log_topics =
            log_topic_ids.into_iter().map(|(_, log_topic_id)| log_topic_id).collect::<Vec<B256>>();

        let alloy_log =
            AlloyLog::new(log.address.parse().unwrap(), log_topics.clone(), log.data.into())
                .unwrap();

        let log = Log::<LogData> {
            inner: alloy_log,
            block_hash: log.block_hash.map(|bh| bh.parse().unwrap()),
            block_number: log.block_number.map(|bn| (bn as u64)),
            block_timestamp: None,
            transaction_hash: log.transaction_hash.map(|th| th.parse().unwrap()),
            transaction_index: log.transaction_index.map(|ti| (ti as u64)),
            log_index: log.log_index.map(|li| (li as u64)),
            removed: false,
        };

        Ok(Self { log: log.clone(), topics: log_topics })
    }
}
