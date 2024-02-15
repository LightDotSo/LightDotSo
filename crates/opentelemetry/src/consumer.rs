// Copyright 2023-2024 Light, Inc.
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

use lazy_static::lazy_static;
use once_cell::sync::Lazy;
use opentelemetry::{global, metrics::UpDownCounter, KeyValue};

lazy_static! {
    pub static ref BLOCK_INDEXED_STATUS: Lazy<UpDownCounter<f64>> =
        Lazy::new(|| global::meter("").f64_up_down_counter("block_indexed_status").init());
}

pub struct ConsumerMetrics {}

impl ConsumerMetrics {
    pub fn set_index_block(value: f64, chain_id: u64, block_number: u64) {
        BLOCK_INDEXED_STATUS.add(
            value,
            &[
                KeyValue::new("chain_id", chain_id.to_string()),
                KeyValue::new("block_number", block_number.to_string()),
            ],
        );
    }
}
