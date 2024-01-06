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

use clap::Parser;
use eyre::Result;
use lightdotso_interpreter::config::InterpreterArgs;
use lightdotso_simulator::types::SimulationRequest;

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_erc1155_transfer() -> Result<()> {
    // https://etherscan.io/tx/0x34869de523b7e8c78c58bbb0f12194318c10f37b8fa7549193f533e2a5ac92fc
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // Bystander token address
        to: "0x495f947276749Ce646f68AC8c248420045cb7b5e".parse()?,
        data: Some("0xf242432a0000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed0000000000000000000000002af8ddab77a7c90a38cf26f29763365d0028cfef2af8ddab77a7c90a38cf26f29763365d0028cfef000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000360c6ebe".parse()?),
        value: None,
        gas_limit: u64::MAX,
        // Tx was on 16306969
        block_number: Some(16306968),
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(request).await?;

    assert!(res.success);

    insta::assert_debug_snapshot!(res);

    Ok(())
}
