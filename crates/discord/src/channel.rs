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

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// The bot user operation channel id (`bot-user-operation`)
lazy_static! {
    pub static ref USER_OPERATION_CHANNEL_ID: u64 = 1298034252268568627;
}

// The core bot activity channel id (`core-bot-activity`)
lazy_static! {
    pub static ref ACTIVITY_CHANNEL_ID: u64 = 1298033130715877416;
}

// The core bot feedback channel id (`core-bot-feedback`)
lazy_static! {
    pub static ref FEEDBACK_CHANNEL_ID: u64 = 1298207852351062059;
}

// The core bot notification channel id (`core-bot-notification`)
lazy_static! {
    pub static ref NOTIFICATION_CHANNEL_ID: u64 = 1142914964219252836;
}

// The core bot test channel id (`core-bot-test`)
lazy_static! {
    pub static ref TEST_CHANNEL_ID: u64 = 1298211913452490803;
}

// The core bot wallet channel id (`core-bot-wallet`)
lazy_static! {
    pub static ref WALLET_CHANNEL_ID: u64 = 1298207852351062059;
}
