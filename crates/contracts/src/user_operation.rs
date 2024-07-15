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

// Copyright 2023-2024 Silius Contributors.
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

use crate::tracer::LogInfo;
use const_hex::hex;
use core::fmt::Debug;
use ethers::{
    abi::{Hash, RawLog},
    contract::EthLogDecode,
    types::Bytes,
};
use eyre::{eyre, Result};
use std::str::FromStr;

// From: https://github.com/silius-rs/silius/blob/62cff148f386283bc44114ec9d545eae427489f2/crates/mempool/src/estimate.rs#L80
// License: Apache-2.0

/// Parse the user operation event from the log
/// Since the user operation event is a generic event, we need to parse it with the specific type
/// `T` that implements `EthLogDecode`
pub fn parse_user_op_event<T: Debug + EthLogDecode>(event: &LogInfo) -> Result<T> {
    let topics = event
        .topics
        .iter()
        .map(|t| {
            let mut hash_str = t.clone();
            if hash_str.len() % 2 != 0 {
                hash_str.insert(0, '0');
            };
            hex::decode(hash_str).map(|mut b| {
                b.resize(32, 0);
                Hash::from_slice(b.as_ref())
            })
        })
        .collect::<Result<Vec<Hash>, _>>()
        .map_err(|e| {
            eyre!("simulate handle user op failed on parsing user op event topic hash, {e:?}")
        })?;
    let data = Bytes::from_str(event.data.as_str()).map_err(|e| {
        eyre!("simulate handle user op failed on parsing user op event data: {e:?}")
    })?;
    let log = RawLog::from((topics, data.to_vec()));
    <T>::decode_log(&log)
        .map_err(|err| eyre!("simulate handle user op failed on parsing user op event: {err:?}"))
}
