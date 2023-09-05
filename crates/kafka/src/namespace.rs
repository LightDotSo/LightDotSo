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

lazy_static! {
    pub static ref NOTIFICATION: String = "notification".to_string();
}
