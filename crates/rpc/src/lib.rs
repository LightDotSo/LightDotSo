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

use axum::{
    body::Body,
    extract::{Path, State},
    http::{Request, Response},
};
use hyper::{body, client::HttpConnector};
use lightdotso_tracing::tracing::info;
use serde::ser::Error;
use serde_json::{Error as SerdeError, Value};

type Client = hyper::client::Client<HttpConnector, Body>;

pub async fn get_method(body: Body) -> Result<String, SerdeError> {
    // Convert the body into bytes
    let body = body::to_bytes(body)
        .await
        .map_err(|_| SerdeError::custom("Error while getting request body"))?;
    let body_json: Value = serde_json::from_slice(&body)?;

    // Try to retrieve the "method" field
    let method = body_json
        .get("method")
        .ok_or(SerdeError::custom("Could not get method field"))?
        .as_str()
        .ok_or(SerdeError::custom("Method field was not a string"))?
        .to_string();

    Ok(method)
}

pub async fn rpc_proxy_handler(
    State(client): State<Client>,
    Path(chain_id): Path<String>,
    mut req: Request<Body>,
) -> Response<Body> {
    info!("chain_id: {}", chain_id);

    info!("req: {:?}", req);

    // Convert hexadecimal chain_id to u64 or normal integer
    // Return 0 if the chain_id is not a hexadecimal or normal integer
    let chain_id: u64 = if chain_id.len() > 2 {
        u64::from_str_radix(&chain_id[2..], 16).unwrap_or_else(|_| chain_id.parse().unwrap_or(0))
    } else {
        chain_id.parse().unwrap_or(0)
    };

    // Return an error if the chain_id is not supported or not found
    if chain_id == 0 {
        return Response::builder().status(404).body(Body::from("Not Found")).unwrap();
    }

    // Consume the body and replace it with an empty one for later reuse
    let full_body = std::mem::replace(req.body_mut(), Body::empty());
    // Call your async function to consume the body
    let full_body_bytes = body::to_bytes(full_body).await.unwrap().to_vec();

    // Clone the body for later reuse
    let body_clone = Body::from(full_body_bytes.clone());
    let body_clone_2 = Body::from(full_body_bytes.clone());

    // Get the method from the body
    let method = get_method(body_clone_2).await;
    if let Ok(method) = method {
        info!("method: {}", method);
    }

    let uri = format!("http://127.0.0.1:3000");

    // Create a new request with the same method and body
    let client_req = Request::builder()
        .uri(uri)
        .header("Content-Type", "application/json")
        .method(req.method())
        .body(body_clone) // use Body::from to create Body owned
        .unwrap();

    client.request(client_req).await.unwrap()

    // * req.uri_mut() = Uri::try_from(uri).unwrap();

    // client.request(req).await.unwrap()
}
