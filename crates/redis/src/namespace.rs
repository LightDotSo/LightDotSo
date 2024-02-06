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

use lazy_static::lazy_static;

// The wallet namesapce
lazy_static! {
    pub static ref WALLETS: String = "wallets".to_string();
}

// The portfolio queue namespace
lazy_static! {
    pub static ref QUEUE_PORTFOLIO: String = "queue:portfolio".to_string();
}

// The token queue namespace
lazy_static! {
    pub static ref QUEUE_TOKEN: String = "queue:token".to_string();
}

// The user operation queue namespace
lazy_static! {
    pub static ref QUEUE_USER_OPERATION: String = "queue:user_operation".to_string();
}
