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

// From: https://github.com/oxidecomputer/progenitor/blob/4a182d734e46fa1ce15415bf5bd497fc347dc43e/example-build/src/main.rs
// License: MPL-2.0

use eyre::Result;

// Include the generated code.
// include!(concat!(env!("OUT_DIR"), "/mod.rs"));

pub async fn main() -> Result<()> {
    // let client = Client::new("https://foo/bar");

    // client
    //     .enrol("auth-token", &types::EnrolBody { host: "".to_string(), key: "".to_string() })
    //     .await?;

    Ok(())
}
