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

// https://etherscan.io/tx/0xee623726751e879ca379d3680a7658e307a6cbc3aa99be7f2706470eebdd969d

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_erc20_transfer() -> Result<()> {
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // ENS token address
        to: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72".parse()?,
        data: Some("0xa9059cbb0000000000000000000000006f8a90995fdce00da1f7dd731d812f6a6d18d1ff000000000000000000000000000000000000000000000001a055690d9db80000".parse()?),
        value: None,
        gas_limit: u64::MAX,
        // Tx was on 13704035
        block_number: Some(13704034),
    };

    // Parse the command line arguments
    let args = InterpreterArgs::parse_from([""]);

    // Run the interpreter
    let res = args.run(request).await?;

    assert!(res.success);

    println!("Result: {:?}", res);

    Ok(())
}
