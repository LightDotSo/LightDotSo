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

use lazy_static::lazy_static;
use once_cell::sync::Lazy;
use opentelemetry::{global, metrics::Counter, KeyValue};

lazy_static! {
    pub static ref POLLING_ATTEMPT_COUNT: Lazy<Counter<u64>> =
        Lazy::new(|| global::meter("").u64_counter("polling_attempt_count").init());
}

pub struct PollingMetrics {}

impl PollingMetrics {
    pub fn set_attempt(chain_id: u64) {
        POLLING_ATTEMPT_COUNT.add(1, &[KeyValue::new("chain_id", chain_id.to_string())]);
    }
}
