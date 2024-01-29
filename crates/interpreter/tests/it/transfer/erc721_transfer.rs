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
async fn test_integration_erc721_transfer() -> Result<()> {
    // https://etherscan.io/tx/0xfc9ab285eef688cac83d0fd32d8da79099202a0606e82843ab5d226e38ac12a1
    let request = SimulationRequest {
        chain_id: 1,
        // kaki.eth
        from: "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed".parse()?,
        // WAGUMI token address
        to: "0x6144D927EE371de7e7f8221b596F3432E7A8e6D9".parse()?,
        data: Some("0x23b872dd0000000000000000000000004fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed000000000000000000000000914a7625b645d0d705b9a0a30d22583e1fb87eb1000000000000000000000000000000000000000000000000000000000000000b".parse()?),
        value: None,
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
        value: None,
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
