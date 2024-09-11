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

#![allow(clippy::unwrap_used)]
#![allow(clippy::expect_used)]

pub mod config;
pub mod constants;
pub mod utils;

use crate::{
    constants::{
        ALCHEMY_RPC_URLS, ANKR_RPC_URLS, BICONOMY_RPC_URLS, BLASTAPI_RPC_URLS, CANDIDE_RPC_URLS,
        CHAINNODES_RPC_URLS, ETHERSPOT_RPC_URLS, GAS_RPC_URL, INFURA_RPC_URLS, LLAMANODES_RPC_URLS,
        NODEREAL_RPC_URLS, OFFICIAL_PUBLIC_RPC_URLS, PARTICLE_RPC_URLS, PAYMASTER_RPC_URL,
        PIMLICO_RPC_URLS, PUBLIC_NODE_RPC_URLS, SILIUS_RPC_URLS, TENDERLY_RPC_URLS,
        THIRDWEB_RPC_URL,
    },
    utils::shuffle_requests,
};
use alloy::primitives::B256;
use axum::{
    body::Body,
    extract::{Path, State},
    http::{Request, Response},
    response::IntoResponse,
};
use http_body_util::BodyExt;
use lightdotso_contracts::{constants::ENTRYPOINT_V060_ADDRESS, types::UserOperationRequest};
use lightdotso_hyper::HyperClient;
use lightdotso_jsonrpsee::types::Request as JSONRPCRequest;
use lightdotso_kafka::{
    rdkafka::producer::FutureProducer, topics::user_operation::produce_user_operation_message,
    types::user_operation::UserOperationMessage,
};
use lightdotso_tracing::tracing::{error, info, trace, warn};
use serde::ser::Error;
use serde_json::{json, Error as SerdeError, Value};
use std::{collections::HashMap, sync::Arc};

/// Get the method from the body of the JSON RPC request
pub async fn get_method(body: Body) -> Result<String, SerdeError> {
    // Convert the body into bytes
    let body = body.collect().await.unwrap().to_bytes();
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
pub async fn get_client_result(
    uri: String,
    client: HyperClient,
    body: &mut Body,
) -> Option<Response<Body>> {
    info!("uri: {}", uri);

    // Clone the body to keep the original body for later reuse
    let req_body: Body = std::mem::replace(body, Body::empty());

    // Create a new request with the same method and body
    let client_req = Request::builder()
        .uri(uri)
        .header("Content-Type", "application/json")
        .method(hyper::Method::POST)
        .body(req_body)
        .unwrap();

    if let Ok(res) = client.request(client_req).await {
        if res.status().is_success() {
            // Consume the body and replace it with an empty one for later reuse
            let full_body: Body = std::mem::replace(res.into_response().body_mut(), Body::empty());

            // If the body contains a error field return None
            if let Ok(body) = full_body.collect().await {
                let body = body.to_bytes();
                // Convert the body into bytes
                let body_json: Value = serde_json::from_slice(&body).unwrap_or_default();
                // If the error code is the speficied error code return None
                if let Some(error) = body_json.get("error") {
                    if let Some(code) = error.get("code") {
                        warn!("Error in body: {:?} code: {:?}", code, body_json);

                        // If the error code is -32001 or -32603 return None
                        // Invalid method
                        if code.as_i64() == Some(-32001) ||
                        // Limit exceeded
                        code.as_i64() == Some(-32005) ||
                        // Block range wide
                        code.as_i64() == Some(-32600) ||
                        // Method not found
                        code.as_i64() == Some(-32601) ||
                        // Invalid params
                        code.as_i64() == Some(-32602)
                        {
                            return None;
                        }

                        // If the error code is from -32500 to -32507 or -32521 return response
                        // Invalid request
                        // From: https://eips.ethereum.org/EIPS/eip-4337
                        if code.as_i64() == Some(-32500) ||
                            code.as_i64() == Some(-32501) ||
                            code.as_i64() == Some(-32502) ||
                            code.as_i64() == Some(-32503) ||
                            code.as_i64() == Some(-32504) ||
                            code.as_i64() == Some(-32505) ||
                            code.as_i64() == Some(-32506) ||
                            code.as_i64() == Some(-32507) ||
                            code.as_i64() == Some(-32521)
                        {
                            warn!("Successfully returning w/ invalid request response: {:?}", body);
                            return Some(
                                Response::builder().status(400).body(Body::from(body)).unwrap(),
                            );
                        }

                        // If the error code is -32602 return the response
                        // Invalid params
                        // From: https://eips.ethereum.org/EIPS/eip-4337
                        if code.as_i64() == Some(-32602) {
                            warn!("Successfully returning w/ invalid params response: {:?}", body);
                            return Some(
                                Response::builder().status(400).body(Body::from(body)).unwrap(),
                            );
                        }

                        // If the error code is -32603 return the response
                        // Internal error
                        if code.as_i64() == Some(-32603) && body_json.get("message").is_some() {
                            warn!("Successfully returning w/ internal error response: {:?}", body);
                            return Some(
                                Response::builder().status(400).body(Body::from(body)).unwrap(),
                            );
                        }
                    }
                }
                // If body is empty return None
                if body_json.is_null() {
                    warn!("Error in body w/ null: {:?}", body_json);
                    return None;
                }
                // Return the response
                info!("Successfully returning w/ response: {:?}", body);
                return Some(Response::builder().status(200).body(Body::from(body)).unwrap());
            }
            None
        } else {
            warn!("Error while getting result from client: {:?}", res);
            None
        }
    } else {
        warn!("Error while making request to client");
        None
    }
}

/// The public rpc handler for the RPC server
pub async fn public_rpc_handler(
    state: State<(HyperClient, Arc<FutureProducer>)>,
    chain_id: Path<String>,
    req: Request<Body>,
) -> Response<Body> {
    rpc_proxy_handler(state, chain_id, req, false).await
}

/// The protected rpc handler for the RPC server
pub async fn protected_rpc_handler(
    state: State<(HyperClient, Arc<FutureProducer>)>,
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
    state: State<(HyperClient, Arc<FutureProducer>)>,
    chain_id: Path<String>,
    req: Request<Body>,
) -> Response<Body> {
    // If the `INTERNAL` environment variable is not true return a 404
    if std::env::var("INTERNAL").unwrap_or_default() != "true" {
        return Response::builder().status(404).body(Body::from("Not Found")).unwrap();
    }

    rpc_proxy_handler(state, chain_id, req, true).await
}

/// The rpc handler for the RPC server
async fn try_rpc_with_url(
    rpc_urls: &HashMap<u64, String>,
    api_key: Option<String>,
    chain_id: &u64,
    client: &HyperClient,
    body: &mut Body,
) -> Option<Response<Body>> {
    if let Some(rpc_url) = rpc_urls.get(chain_id) {
        let full_url = match api_key {
            // Format the url with the api_key if it exists
            Some(key) => format!("{}{}", rpc_url, key),
            // If the api_key does not exist return the url as is
            None => rpc_url.to_string(),
        };

        // Get the result from the client
        let result = get_client_result(full_url, client.clone(), body).await;
        if let Some(mut resp) = result {
            // Add the current rpc url to the response
            resp.headers_mut().insert("X-RPC-URL", rpc_url.parse().unwrap());

            return Some(resp);
        }
    }

    // Return None if the rpc url is not found
    None
}

/// The rpc proxy handler for the RPC server
pub async fn rpc_proxy_handler(
    State(state): State<(HyperClient, Arc<FutureProducer>)>,
    Path(chain_id): Path<String>,
    mut req: Request<Body>,
    debug: bool,
) -> Response<Body> {
    info!("req: {:?}", req);
    let body = std::mem::take(req.body_mut());
    let body_bytes = body.collect().await.unwrap().to_bytes();

    // Get the client from the state
    let client = state.0.clone();

    // Get the producer from the state
    let producer = state.1.clone();

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

    // Get the method from the body
    let method = get_method(Body::from(body_bytes.clone())).await;

    if let Ok(method) = method {
        info!("method: {}", method);
        let req_body_string = String::from_utf8(body_bytes.clone().to_vec())
            .unwrap_or_else(|_| "Failed to convert byte array to UTF-8".to_string());
        info!("body: {}", req_body_string);

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
                            let private_chain_id =
                                private_rpc_url_split[0].parse::<u64>().unwrap_or(0);

                            // If the private chain_id is the same as the chain_id
                            if private_chain_id == chain_id {
                                let uri = private_rpc_url_split[1].to_string();

                                // Get the result from the client
                                let result = get_client_result(
                                    uri,
                                    client.clone(),
                                    &mut Body::from(body_bytes.clone()),
                                )
                                .await;
                                if let Some(resp) = result {
                                    return resp;
                                }
                            }
                        }
                    }
                }

                let mut requests = vec![
                    (&*CHAINNODES_RPC_URLS, Some(std::env::var("CHAINNODES_API_KEY").unwrap())),
                    (&*BLASTAPI_RPC_URLS, Some(std::env::var("BLAST_API_KEY").unwrap())),
                    (&*ALCHEMY_RPC_URLS, Some(std::env::var("ALCHEMY_API_KEY").unwrap())),
                    (&*NODEREAL_RPC_URLS, Some(std::env::var("NODEREAL_API_KEY").unwrap())),
                ];

                shuffle_requests(&mut requests);

                for (url, key) in &requests {
                    let result = try_rpc_with_url(
                        url,
                        key.clone(),
                        &chain_id,
                        &client,
                        &mut Body::from(body_bytes.clone()),
                    )
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
                // Deserialize w/ serde_json
                let body_json_result =
                    serde_json::from_slice::<JSONRPCRequest<Vec<Value>>>(&body_bytes.clone());

                // Provide a default case for `body_json`
                let body_json = body_json_result.unwrap_or(JSONRPCRequest {
                    jsonrpc: "2.0".to_string(),
                    id: 1,
                    method: method.clone(),
                    params: vec![],
                });

                // Get the params and insert "chainId" into the JSON object
                let mut params: Vec<Value> = body_json.params;
                params.push(json!(chain_id));
                trace!("params: {:?}", params);

                let mut requests = vec![
                    (&*CANDIDE_RPC_URLS, None),
                    (&*PARTICLE_RPC_URLS, None),
                    (
                        &*PIMLICO_RPC_URLS,
                        Some("?apikey=".to_owned() + &std::env::var("PIMLICO_API_KEY").unwrap()),
                    ),
                    (&*ETHERSPOT_RPC_URLS, None),
                    (&*BICONOMY_RPC_URLS, Some(std::env::var("BICONOMY_API_KEY").unwrap())),
                    (&*ALCHEMY_RPC_URLS, Some(std::env::var("ALCHEMY_API_KEY").unwrap())),
                    (&*SILIUS_RPC_URLS, None),
                ];

                shuffle_requests(&mut requests);

                for (url, key) in &requests {
                    let result = try_rpc_with_url(
                        url,
                        key.clone(),
                        &chain_id,
                        &client,
                        &mut Body::from(body_bytes.clone()),
                    )
                    .await;

                    if let Some(resp) = result {
                        // If the method is `eth_sendUserOperation` and the response is 200, get the
                        // `result` in the response body and log it
                        if method == "eth_sendUserOperation" && resp.status().is_success() {
                            let body = resp.into_body().collect().await.unwrap().to_bytes();
                            let body_json: Value = serde_json::from_slice(&body).unwrap();
                            if let Some(result) = body_json.get("result") {
                                info!("result: {:?}", result);

                                // Convert the result to a B256
                                let result =
                                    serde_json::from_value::<String>(result.clone()).unwrap();
                                let hash: Result<B256, _> = result.parse();
                                info!("hash: {:?}", hash);

                                if let Ok(hash) = hash {
                                    info!("Successfully queueing user operation message");
                                    let _ = produce_user_operation_message(
                                        producer.clone(),
                                        &UserOperationMessage {
                                            hash,
                                            chain_id,
                                            is_pending_update: true,
                                        },
                                    )
                                    .await;
                                }
                            }

                            // Reconstruct the response and return
                            return Response::builder().status(200).body(Body::from(body)).unwrap();
                        }

                        return resp;
                    }
                }
            }
            "gas_requestGasEstimation" => {
                // Construct the params for the rpc request
                let params = vec![json!(chain_id)];
                let req_body = json!({
                    "jsonrpc": "2.0",
                    "method": method.as_str(),
                    "params": params,
                    "id": 1
                });
                // Convert the params to hyper Body
                let mut hyper_body = Body::from(req_body.to_string());

                let result =
                    get_client_result(GAS_RPC_URL.to_string(), client.clone(), &mut hyper_body)
                        .await;
                if let Some(resp) = result {
                    return resp;
                }
            }
            "paymaster_requestPaymasterAndData" | "paymaster_requestGasAndPaymasterAndData" => {
                // Deserialize w/ serde_json
                let body_json_result = serde_json::from_slice::<
                    JSONRPCRequest<Vec<UserOperationRequest>>,
                >(&body_bytes.clone());

                if let Ok(body_json) = body_json_result {
                    // Get the user_operation from the body
                    let user_operation = body_json.params;
                    let params = vec![
                        json!(user_operation[0]),
                        json!(format!("{:?}", *ENTRYPOINT_V060_ADDRESS)),
                        json!(chain_id),
                    ];
                    info!("params: {:?}", params);

                    let req_body = json!({
                        "jsonrpc": "2.0",
                        "method": method.as_str(),
                        "params": params.clone(),
                        "id": 1
                    });
                    // Convert the params to hyper Body
                    let mut hyper_body = Body::from(req_body.to_string());

                    // Get the result from the client
                    let result = get_client_result(
                        PAYMASTER_RPC_URL.to_string(),
                        client.clone(),
                        &mut hyper_body,
                    )
                    .await;
                    if let Some(resp) = result {
                        return resp;
                    }
                } else {
                    warn!("Error while deserializing body_json_result: {:?}", body_json_result);
                    return Response::builder()
                        .status(400)
                        .body(Body::from(body_json_result.unwrap_err().to_string()))
                        .unwrap();
                }
            }
            &_ => {}
        }
    } else {
        error!("Error while getting method: {:?}", method);
    }

    // Construct the params for the rpc request
    let mut requests = vec![
        (&*ANKR_RPC_URLS, None),
        (&*LLAMANODES_RPC_URLS, None),
        (&*TENDERLY_RPC_URLS, None),
        (&*PUBLIC_NODE_RPC_URLS, None),
        (&*OFFICIAL_PUBLIC_RPC_URLS, None),
        (&*NODEREAL_RPC_URLS, Some(std::env::var("NODEREAL_API_KEY").unwrap())),
        (&*INFURA_RPC_URLS, Some(std::env::var("INFURA_API_KEY").unwrap())),
    ];

    shuffle_requests(&mut requests);

    for (url, key) in &requests {
        let result = try_rpc_with_url(
            url,
            key.clone(),
            &chain_id,
            &client,
            &mut Body::from(body_bytes.clone()),
        )
        .await;

        if let Some(resp) = result {
            return resp;
        }
    }

    // Create a temporary rpc hash map for the thirdweb rpc url
    let mut thirdweb_rpc_urls = HashMap::new();
    thirdweb_rpc_urls.insert(chain_id, format!("https://{}.{}", chain_id, *THIRDWEB_RPC_URL,));

    // Fallback to thirdweb rpc url
    let result = try_rpc_with_url(
        &thirdweb_rpc_urls,
        None,
        &chain_id,
        &client,
        &mut Body::from(body_bytes.clone()),
    )
    .await;

    if let Some(resp) = result {
        return resp;
    }

    // Return an error if the chain_id is not supported or not found
    error!("Could not resolve rpc url for chain_id: {}", chain_id);
    Response::builder().status(404).body(Body::from("Not Found for RPC Request")).unwrap()
}
