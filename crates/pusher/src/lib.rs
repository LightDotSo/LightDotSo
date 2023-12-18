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
    let pusher = PusherBuilder::new_with_client(client, "333", "PUSHER_KEY", "PUSHER_SECRET")
        .host("soketi.light.so")
        .secure()
        .finalize();

    Ok(pusher)
}
