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

use once_cell::sync::Lazy;
use prometheus::{register_gauge_vec, Encoder, GaugeVec, TextEncoder};
use serde::Deserialize;
#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct ApiResponse {
    latest_block_number: i64,
    latest_indexed_block: i64,
    all_percentage: f64,
    last_300_percentage: f64,
}

const CHAIN_IDS: [u64; 8] = [1, 10, 56, 100, 8453, 42161, 43114, 11155111];

static LATEST_BLOCK_NUMBER: Lazy<GaugeVec> = Lazy::new(|| {
    register_gauge_vec!("latest_block_number", "Latest Block Number", &["chain_id"]).unwrap()
});

static LATEST_INDEXED_BLOCK: Lazy<GaugeVec> = Lazy::new(|| {
    register_gauge_vec!("latest_indexed_block", "Latest Indexed Block", &["chain_id"]).unwrap()
});

static ALL_PERCENTAGE: Lazy<GaugeVec> =
    Lazy::new(|| register_gauge_vec!("all_percentage", "All Percentage", &["chain_id"]).unwrap());

static LAST300_PERCENTAGE: Lazy<GaugeVec> = Lazy::new(|| {
    register_gauge_vec!("last300_percentage", "Last 300 Percentage", &["chain_id"]).unwrap()
});

pub async fn metrics_handler() -> axum::response::Html<String> {
    let encoder = TextEncoder::new();
    let metric_families = prometheus::gather();
    let mut buffer = vec![];
    encoder.encode(&metric_families, &mut buffer).unwrap();
    axum::response::Html(String::from_utf8_lossy(&buffer).to_string())
}

pub async fn parse_indexer_metrics() {
    for &chain_id in CHAIN_IDS.iter() {
        let data: ApiResponse = reqwest::get(&format!("https://indexer.light.so/{}", chain_id))
            .await
            .unwrap()
            .json()
            .await
            .unwrap();

        LATEST_BLOCK_NUMBER
            .with_label_values(&[&chain_id.to_string()])
            .set(data.latest_block_number as f64);
        LATEST_INDEXED_BLOCK
            .with_label_values(&[&chain_id.to_string()])
            .set(data.latest_indexed_block as f64);
        ALL_PERCENTAGE.with_label_values(&[&chain_id.to_string()]).set(data.all_percentage);
        LAST300_PERCENTAGE
            .with_label_values(&[&chain_id.to_string()])
            .set(data.last_300_percentage);
    }
}
