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

use crate::polling::user_operations::UserOperation;
use lightdotso_common::traits::HexToBytes;
use lightdotso_prisma::{user_operation, UserOperationStatus};

// Implement From<UserOperation> for User operation.
impl From<UserOperation> for user_operation::Data {
    fn from(user_operation: UserOperation) -> Self {
        Self {
            chain_id: 0,
            hash: user_operation.id.0.parse().unwrap(),
            sender: user_operation.sender.0.parse().unwrap(),
            nonce: user_operation.nonce.0.parse().unwrap(),
            init_code: user_operation.init_code.clone().0.hex_to_bytes().unwrap(),
            call_data: user_operation.call_data.clone().0.hex_to_bytes().unwrap(),
            call_gas_limit: user_operation.call_gas_limit.0.parse().unwrap(),
            verification_gas_limit: user_operation.verification_gas_limit.0.parse().unwrap(),
            pre_verification_gas: user_operation.pre_verification_gas.0.parse().unwrap(),
            max_fee_per_gas: user_operation.max_fee_per_gas.0.parse().unwrap(),
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas.0.parse().unwrap(),
            paymaster_and_data: user_operation.paymaster_and_data.clone().0.hex_to_bytes().unwrap(),
            status: UserOperationStatus::Executed,
            signature: user_operation.signature.clone().0.hex_to_bytes().unwrap().into(),
            entry_point: user_operation.entry_point.0.parse().unwrap(),
            paymaster: None,
            paymaster_id: None,
            transaction: None,
            transaction_hash: None,
            wallet: None,
            wallet_address: user_operation.light_wallet.id.0.parse().unwrap(),
            notification: None,
            notification_id: None,
            history: None,
            signatures: None,
            user_operation_category: None,
        }
    }
}
