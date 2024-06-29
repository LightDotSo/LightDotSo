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

use clap::Parser;
use eyre::Result;
use lightdotso_interpreter::config::InterpreterArgs;
use lightdotso_simulator::types::SimulationRequest;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_eth_transfer() -> Result<()> {
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // fiveoutofnine.eth
        to: "0xA85572Cd96f1643458f17340b6f0D6549Af482F5".parse()?,
        data: None,
        value: Some(1),
        gas_limit: u64::MAX,
        block_number: None,
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(vec![request]).await?;

    println!("{:?}", res);

    assert!(!res.asset_changes.is_empty());

    // insta::assert_debug_snapshot!(res);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_light_eth_transfer() -> Result<()> {
    let request = SimulationRequest {
        chain_id: 10,
        // Light
        from: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F".parse()?,
        // kaki.eth
        to: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        data: None,
        value: Some(1),
        gas_limit: u64::MAX,
        block_number: Some(114445705),
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(vec![request]).await?;

    println!("{:?}", res);

    assert!(!res.asset_changes.is_empty());

    // insta::assert_debug_snapshot!(res);

    Ok(())
}
