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

use alloy::primitives::U256;
use clap::Parser;
use eyre::Result;
use lightdotso_interpreter::config::InterpreterArgs;
use lightdotso_simulator::types::SimulationRequest;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_erc721_transfer() -> Result<()> {
    // https://etherscan.io/tx/0xfc9ab285eef688cac83d0fd32d8da79099202a0606e82843ab5d226e38ac12a1
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // WAGUMI token address
        to: "0x6144D927EE371de7e7f8221b596F3432E7A8e6D9".parse()?,
        data: Some("0x23b872dd0000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000914a7625b645d0d705b9a0a30d22583e1fb87eb1000000000000000000000000000000000000000000000000000000000000000b".parse()?),
        value: U256::ZERO,
        gas_limit: u64::MAX,
        // Tx was on 16318897
        block_number: Some(16318896),
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(vec![request]).await?;

    assert!(res.success);

    insta::assert_debug_snapshot!(res);

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_erc721_mint() -> Result<()> {
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // WAGUMI token address
        to: "0x6144D927EE371de7e7f8221b596F3432E7A8e6D9".parse()?,
        data: Some("0x1249c58b".parse()?),
        value: U256::ZERO,
        gas_limit: u64::MAX,
        // Tx was on 13834190
        block_number: Some(13834189),
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(vec![request]).await?;

    assert!(res.success);

    insta::assert_debug_snapshot!(res);

    Ok(())
}
