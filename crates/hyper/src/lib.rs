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

#![allow(clippy::expect_used)]

use axum::body::Body;
use eyre::Result;
use hyper_rustls::{HttpsConnector, HttpsConnectorBuilder};
use hyper_util::{
    client::legacy::{connect::HttpConnector, Builder, Client},
    rt::TokioExecutor,
};
use rustls::crypto::ring;

pub type HyperClient = Client<HttpsConnector<HttpConnector>, Body>;

pub fn get_hyper_client() -> Result<HyperClient> {
    // Attempt to install the default crypto provider
    let _ = ring::default_provider().install_default();

    // Build the https connector
    let https =
        HttpsConnectorBuilder::new().with_webpki_roots().https_or_http().enable_http1().build();

    // Build the hyper client
    Ok(Builder::new(TokioExecutor::new()).to_owned().build(https))
}
