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

use lazy_static::lazy_static;

// The wallet namesapce
lazy_static! {
    pub static ref WALLETS: String = "wallets".to_string();
}

// The node queue namespace
lazy_static! {
    pub static ref QUEUE_NODE: String = "queue:node".to_string();
}

// The portfolio queue namespace
lazy_static! {
    pub static ref QUEUE_PORTFOLIO: String = "queue:portfolio".to_string();
}

// The token queue namespace
lazy_static! {
    pub static ref QUEUE_TOKEN: String = "queue:token".to_string();
}

// The transaction queue namespace
lazy_static! {
    pub static ref QUEUE_TRANSACTION: String = "queue:transaction".to_string();
}

// The user operation queue namespace
lazy_static! {
    pub static ref QUEUE_USER_OPERATION: String = "queue:user_operation".to_string();
}
