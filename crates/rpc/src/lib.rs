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

pub mod config;
mod constants;

use crate::constants::{BUNDLER_RPC_URLS, INFURA_RPC_URLS};
use axum::{
    body::Body,
    extract::{Path, State},
    http::{Request, Response},
};
use hyper::{body, client::HttpConnector};
use hyper_rustls::HttpsConnector;
use lightdotso_tracing::tracing::{error, info};
use serde::ser::Error;
use serde_json::{Error as SerdeError, Value};

pub type Client = hyper::client::Client<HttpsConnector<HttpConnector>, Body>;

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

async fn get_client_result(uri: String, client: Client, body: Body) -> Response<Body> {
    info!("uri: {}", uri);

    // Create a new request with the same method and body
    let client_req = Request::builder()
        .uri(uri)
        .header("Content-Type", "application/json")
        .method(hyper::Method::POST)
        .body(body)
        .unwrap();

    client.request(client_req).await.unwrap()
}

pub async fn rpc_proxy_handler(
    State(client): State<Client>,
    Path(chain_id): Path<String>,
    mut req: Request<Body>,
) -> Response<Body> {
    info!("req: {:?}", req);

    // Convert hexadecimal chain_id to u64 or normal integer
    // Return 0 if the chain_id is not a hexadecimal or normal integer
    let chain_id: u64 = if chain_id.starts_with("0x") {
        u64::from_str_radix(chain_id.strip_prefix("0x").unwrap(), 16)
            .unwrap_or_else(|_| chain_id.parse().unwrap_or(0))
    } else {
        chain_id.parse().unwrap_or(0)
    };
    info!("chain_id: {}", chain_id);

    // Return an error if the chain_id is not supported or not found
    if chain_id == 0 {
        return Response::builder().status(404).body(Body::from("Not Found")).unwrap();
    }

    // Consume the body and replace it with an empty one for later reuse
    let full_body = std::mem::replace(req.body_mut(), Body::empty());
    // Call your async function to consume the body
    let full_body_bytes = body::to_bytes(full_body).await.unwrap().to_vec();

    // Get the method from the body
    let method = get_method(Body::from(full_body_bytes.clone())).await;
    if let Ok(method) = method {
        match method.as_str() {
            "eth_sendUserOperation" |
            "eth_estimateUserOperationGas" |
            "eth_supportedEntryPoints" |
            "eth_getUserOperationByHash" |
            "eth_getUserOperationReceipt" => {
                info!("method: {}", method);

                // Get the rpc url from the constants
                if let Some(rpc) = BUNDLER_RPC_URLS.get(&chain_id) {
                    // Get the result from the client
                    let result = get_client_result(
                        rpc.clone(),
                        client.clone(),
                        Body::from(full_body_bytes.clone()),
                    )
                    .await;
                    if result.status().is_success() {
                        return result;
                    } else {
                        error!("Error while getting result from client: {:?}", result);
                    }
                }
            }
            &_ => {}
        }
    }

    // Get the rpc url from the constants
    if let Some(infura_rpc_url) = INFURA_RPC_URLS.get(&chain_id) {
        let uri = format!("{}{}", infura_rpc_url, std::env::var("INFURA_API_KEY").unwrap());

        // Get the result from the client
        let result = get_client_result(uri, client, Body::from(full_body_bytes.clone())).await;
        if result.status().is_success() {
            return result;
        } else {
            error!("Error while getting result from client: {:?}", result);
        }
    }

    // Return an error if the chain_id is not supported or not found
    Response::builder().status(404).body(Body::from("Not Found for RPC Request")).unwrap()
    // * req.uri_mut() = Uri::try_from(uri).unwrap();
    // client.request(req).await.unwrap()
}
