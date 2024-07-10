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

// The activity namesapce
lazy_static! {
    pub static ref ACTIVITY: String = "activity".to_string();
}

// The billing operation namesapce
lazy_static! {
    pub static ref BILLING_OPERATION: String = "billing-operation".to_string();
}

// The covalent namesapce
lazy_static! {
    pub static ref COVALENT: String = "covalent".to_string();
}

// The interpretation namesapce
lazy_static! {
    pub static ref INTERPRETATION: String = "interpretation".to_string();
}

// The node namesapce
lazy_static! {
    pub static ref NODE: String = "node".to_string();
}

// The notification namesapce
lazy_static! {
    pub static ref NOTIFICATION: String = "notification".to_string();
}

// The portfolio namesapce
lazy_static! {
    pub static ref PORTFOLIO: String = "portfolio".to_string();
}

// The routescan namesapce
lazy_static! {
    pub static ref ROUTESCAN: String = "routescan".to_string();
}

// The transaction namesapce
lazy_static! {
    pub static ref TRANSACTION: String = "transaction".to_string();
}

// The retry transaction namesapce
lazy_static! {
    pub static ref RETRY_TRANSACTION: String = "retry-transaction".to_string();
}

// The retry transaction 0 namesapce
lazy_static! {
    pub static ref RETRY_TRANSACTION_0: String = "retry-transaction-0".to_string();
}

// The retry transaction 1 namesapce
lazy_static! {
    pub static ref RETRY_TRANSACTION_1: String = "retry-transaction-1".to_string();
}

// The retry transaction 2 namesapce
lazy_static! {
    pub static ref RETRY_TRANSACTION_2: String = "retry-transaction-2".to_string();
}

// The error transaction namesapce
lazy_static! {
    pub static ref ERROR_TRANSACTION: String = "error-transaction".to_string();
}

// The paymaster operation namesapce
lazy_static! {
    pub static ref PAYMASTER_OPERATION: String = "paymaster-operation".to_string();
}

// The user operation namesapce
lazy_static! {
    pub static ref USER_OPERATION: String = "user-operation".to_string();
}
