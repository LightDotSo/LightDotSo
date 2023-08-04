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

use ethers::types::Address;
use lazy_static::lazy_static;

// The factory addresses
lazy_static! {
    pub static ref FACTORY_ADDRESSES: [Address; 1] = [
        // v0.1.0
        "0x262aD6Becda7CE4B047a3130491978A8f35F9aeC".parse().unwrap(),
        // v0.2.0
        // "0x262aD6Becda7CE4B047a3130491978A8f35F9aeC".parse().unwrap(),
    ];
}
