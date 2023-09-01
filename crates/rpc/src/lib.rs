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

use crate::constants::{
    BUNDLER_RPC_URLS, CHAINNODES_RPC_URLS, GAS_RPC_URL, INFURA_RPC_URLS, PAYMASTER_RPC_URL,
    PUBLIC_RPC_URLS, SIMULATOR_RPC_URL,
};
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

/// Get the method from the body of the JSON RPC request
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

/// Get the result from the client
async fn get_client_result(uri: String, client: Client, body: Body) -> Option<Response<Body>> {
    info!("uri: {}", uri);

    // Create a new request with the same method and body
    let client_req = Request::builder()
        .uri(uri)
        .header("Content-Type", "application/json")
        .method(hyper::Method::POST)
        .body(body)
        .unwrap();

    if let Ok(mut res) = client.request(client_req).await {
        // Consume the body and replace it with an empty one for later reuse
        let full_body = std::mem::replace(res.body_mut(), Body::empty());

        if res.status().is_success() {
            // If the body contains a error field return None
            if let Ok(body) = body::to_bytes(full_body).await {
                // Convert the body into bytes
                let body_json: Value = serde_json::from_slice(&body).unwrap_or_default();
                // If the error code is the speficied error code return None
                if let Some(error) = body_json.get("error") {
                    if let Some(code) = error.get("code") {
                        // If the error code is -32001 or -32603 return None
                        // Invalid method
                        if code.as_i64() == Some(-32001) ||
                        // Internal error
                        code.as_i64() == Some(-32603) ||
                        // Limit exceeded
                        code.as_i64() == Some(-32005)
                        {
                            error!("Error in body w/ code: {:?}", body_json);
                            return None;
                        }
                    }
                }
                // If body is empty return None
                if body_json.is_null() {
                    error!("Error in body w/ null: {:?}", body_json);
                    return None;
                }
                // Return the response
                return Some(Response::builder().status(200).body(Body::from(body)).unwrap());
            }
            None
        } else {
            error!("Error while getting result from client: {:?}", res);
            None
        }
    } else {
        error!("Error while making request to client");
        None
    }
}

/// The public rpc handler for the RPC server
pub async fn public_rpc_handler(
    state: State<Client>,
    chain_id: Path<String>,
    req: Request<Body>,
) -> Response<Body> {
    rpc_proxy_handler(state, chain_id, req, false).await
}

/// The protected rpc handler for the RPC server
pub async fn protected_rpc_handler(
    state: State<Client>,
    Path((key, chain_id)): Path<(String, String)>,
    req: Request<Body>,
) -> Response<Body> {
    // If the key is not in the `PROTECTED_RPC_KEYS` environment variable return a 404
    if !std::env::var("PROTECTED_RPC_KEYS")
        .unwrap_or_default()
        .split(',')
        .any(|k| k == key.as_str())
    {
        return Response::builder().status(404).body(Body::from("Not Found")).unwrap();
    }

    rpc_proxy_handler(state, Path(chain_id), req, true).await
}

/// The internal rpc handler for the RPC server
pub async fn internal_rpc_handler(
    state: State<Client>,
    chain_id: Path<String>,
    req: Request<Body>,
) -> Response<Body> {
    // If the `INTERNAL` environment variable is not true return a 404
    if std::env::var("INTERNAL").unwrap_or_default() != "true" {
        return Response::builder().status(404).body(Body::from("Not Found")).unwrap();
    }

    rpc_proxy_handler(state, chain_id, req, true).await
}

/// The rpc proxy handler for the RPC server
pub async fn rpc_proxy_handler(
    State(client): State<Client>,
    Path(chain_id): Path<String>,
    mut req: Request<Body>,
    debug: bool,
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
        info!("method: {}", method);

        match method.as_str() {
            "debug_traceBlock" |
            "debug_traceBlockByHash" |
            "debug_traceBlockByNumber" |
            "debug_traceCall" |
            "debug_traceTransaction" => {
                if !debug {
                    return Response::builder()
                        .status(404)
                        .body(Body::from("Debug Not Enabled"))
                        .unwrap();
                }

                // Get the rpc url from the chainnodes constants
                if let Some(chainnodes_rpc_url) = CHAINNODES_RPC_URLS.get(&chain_id) {
                    let uri = format!(
                        "{}{}",
                        chainnodes_rpc_url,
                        std::env::var("CHAINNODES_API_KEY").unwrap()
                    );

                    // Get the result from the client
                    let result =
                        get_client_result(uri, client.clone(), Body::from(full_body_bytes.clone()))
                            .await;
                    if let Some(resp) = result {
                        return resp;
                    }
                }
            }
            "eth_sendUserOperation" |
            "eth_estimateUserOperationGas" |
            "eth_supportedEntryPoints" |
            "eth_getUserOperationByHash" |
            "eth_getUserOperationReceipt" => {
                // Get the rpc url from the constants
                if let Some(rpc) = BUNDLER_RPC_URLS.get(&chain_id) {
                    // Get the result from the client
                    let result = get_client_result(
                        rpc.clone(),
                        client.clone(),
                        Body::from(full_body_bytes.clone()),
                    )
                    .await;
                    if let Some(resp) = result {
                        return resp;
                    }
                }
            }
            "gas_requestGasEstimation" => {
                let result = get_client_result(
                    GAS_RPC_URL.to_string(),
                    client.clone(),
                    Body::from(full_body_bytes.clone()),
                )
                .await;
                if let Some(resp) = result {
                    return resp;
                }
            }
            "paymaster_requestPaymasterAndData" | "paymaster_requestGasAndPaymasterAndData" => {
                let result = get_client_result(
                    PAYMASTER_RPC_URL.to_string(),
                    client.clone(),
                    Body::from(full_body_bytes.clone()),
                )
                .await;
                if let Some(resp) = result {
                    return resp;
                }
            }
            "simulator_simulateExecution" |
            "simulator_simulateExecutionBundle" |
            "simulator_simulateAssetChanges" |
            "simulator_simulateAssetChangesBundle" |
            "simulator_simulateUserOperation" |
            "simulator_simulateUserOperationBundle" |
            "simulator_simulateUserOperationAssetChanges" |
            "simulator_simulateUserOperationAssetChangesBundle" => {
                let result = get_client_result(
                    SIMULATOR_RPC_URL.to_string(),
                    client.clone(),
                    Body::from(full_body_bytes.clone()),
                )
                .await;
                if let Some(resp) = result {
                    return resp;
                }
            }
            &_ => {}
        }
    }

    // Get the public rpc url from the constants
    if let Some(public_rpc_url) = PUBLIC_RPC_URLS.get(&chain_id) {
        let uri = public_rpc_url.clone();

        // Get the result from the client
        let result =
            get_client_result(uri, client.clone(), Body::from(full_body_bytes.clone())).await;
        if let Some(resp) = result {
            return resp;
        }
    }

    // Get the rpc url from the constants
    if let Some(infura_rpc_url) = INFURA_RPC_URLS.get(&chain_id) {
        let uri = format!("{}{}", infura_rpc_url, std::env::var("INFURA_API_KEY").unwrap());

        // Get the result from the client
        let result =
            get_client_result(uri, client.clone(), Body::from(full_body_bytes.clone())).await;
        if let Some(resp) = result {
            return resp;
        }
    }

    // Get the rpc url from secret env `PRIVATE_RPC_URLS`
    // The env is a comma separated list w/ chain_id of rpc urls
    // Example: 1=https://mainnet.infura.io/v3/123,4=https://rinkeby.infura.io/v3/123
    if let Ok(private_rpc_urls) = std::env::var("PRIVATE_RPC_URLS") {
        // Split the env into a vector of rpc urls
        for private_rpc_url in private_rpc_urls.split(',') {
            // Trim the rpc url
            let private_rpc_url = private_rpc_url.trim();
            // Split the rpc url into a vector of chain_id and rpc url
            let private_rpc_url_split: Vec<&str> = private_rpc_url.split('=').collect();
            // If the vector has 2 elements
            if private_rpc_url_split.len() == 2 {
                // Get the chain_id from the private rpc url
                let private_chain_id = private_rpc_url_split[0].parse::<u64>().unwrap_or(0);

                // If the private chain_id is the same as the chain_id
                if private_chain_id == chain_id {
                    let uri = private_rpc_url_split[1].to_string();

                    // Get the result from the client
                    let result =
                        get_client_result(uri, client.clone(), Body::from(full_body_bytes.clone()))
                            .await;
                    if let Some(resp) = result {
                        return resp;
                    }
                }
            }
        }
    }

    // Return an error if the chain_id is not supported or not found
    Response::builder().status(404).body(Body::from("Not Found for RPC Request")).unwrap()
}
