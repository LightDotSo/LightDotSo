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

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

export type UserOperationData = {
  call_data: string;
  call_gas_limit: number;
  chain_id: number;
  hash: string;
  init_code: string;
  max_fee_per_gas: number;
  max_priority_fee_per_gas: number;
  nonce: number;
  paymaster?: {
    address: string;
    sender: string;
    sender_nonce: number;
  } | null;
  paymaster_and_data: string;
  pre_verification_gas: number;
  sender: string;
  signatures: {
    owner_id: string;
    signature: string;
    signature_type: number;
  }[];
  status: string;
  transaction?: {
    hash: string;
  } | null;
  verification_gas_limit: number;
}[];
