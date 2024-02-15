// Copyright 2023-2024 Light, Inc.
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

use ethers::types::Address;
use lazy_static::lazy_static;

// The entrypoint addresses
lazy_static! {
    pub static ref ENTRYPOINT_ADDRESSES: [Address; 1] = [
      // Local
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789".parse().unwrap(),
    ];
}
