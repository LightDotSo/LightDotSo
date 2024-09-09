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
use dotenvy::dotenv;
use eyre::Result;
use lightdotso_interpreter::config::InterpreterArgs;
use lightdotso_simulator::types::SimulationRequest;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_erc1155_transfer() -> Result<()> {
    // Load the environment variables.
    let _ = dotenv();

    // https://etherscan.io/tx/0x34869de523b7e8c78c58bbb0f12194318c10f37b8fa7549193f533e2a5ac92fc
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // Bystander token address
        to: "0x495f947276749Ce646f68AC8c248420045cb7b5e".parse()?,
        data: Some("0xf242432a0000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed0000000000000000000000002af8ddab77a7c90a38cf26f29763365d0028cfef2af8ddab77a7c90a38cf26f29763365d0028cfef000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000360c6ebe".parse()?),
        value: U256::ZERO,
        gas_limit: u64::MAX,
        // Tx was on 16306969
        block_number: Some(16306968),
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(vec![request]).await?;

    assert!(res.success);

    insta::assert_debug_snapshot!(res);

    Ok(())
}
