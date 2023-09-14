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
use prometheus::{register_int_counter_vec, IntCounterVec};

lazy_static! {
    /// Example usage:
    /// COUNTER.with_label_values(&["bar", "prometheus"]).inc();
    pub static ref COUNTER: Lazy<IntCounterVec> = Lazy::new(|| {
        register_int_counter_vec!(
            "custom_prometheus_counter",
            "Custom counter",
            &["foo", "library"]
        )
        .unwrap()
    });
}
