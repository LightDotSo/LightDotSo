// Copyright 2023-2024 Light
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

use eyre::Result;
use hyper::client::{self, HttpConnector};
use hyper_rustls::HttpsConnector;
use pusher::{Pusher, PusherBuilder};

pub mod channel;
pub mod event;

/// Get a Pusher consumer with the required settings.
pub fn get_pusher() -> Result<Pusher<HttpsConnector<HttpConnector>>> {
    // Create a client
    let https = hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()
        .https_or_http()
        .enable_http1()
        .build();
    let client: client::Client<_, hyper::Body> = client::Client::builder().build(https);

    // Create a Pusher provider
    let pusher = PusherBuilder::new_with_client(
        client,
        &std::env::var("SOKETI_DEFAULT_APP_ID")?,
        &std::env::var("SOKETI_DEFAULT_APP_KEY")?,
        "PUSHER_SECRET",
    )
    .host("soketi.light.so")
    .secure()
    .finalize();

    Ok(pusher)
}
