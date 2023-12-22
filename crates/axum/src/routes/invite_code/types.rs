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

use ethers_main::core::rand::{self, Rng};
use lightdotso_prisma::invite_code;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// InviteCode root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct InviteCode {
    /// The id of the invite code.
    id: String,
    /// The code of the invite code.
    code: String,
    /// The status of the invite code.
    status: String,
}

/// Implement From<invite_code::Data> for InviteCode.
impl From<invite_code::Data> for InviteCode {
    fn from(invite_code: invite_code::Data) -> Self {
        Self { id: invite_code.id, code: invite_code.code, status: invite_code.status.to_string() }
    }
}

/// Create a trait to generate the invite code in format AAA-ZZZ.
pub(crate) trait GenerateInviteCode {
    /// Generate the invite code.
    fn generate_invite_code() -> String;
}

/// Implement GenerateInviteCode for InviteCode.
impl GenerateInviteCode for InviteCode {
    fn generate_invite_code() -> String {
        let mut rng = rand::thread_rng();
        let chars: Vec<char> =
            (b'A'..=b'Z').map(char::from).chain((b'0'..=b'9').map(char::from)).collect();
        let mut code = String::new();
        for _ in 0..3 {
            let idx = rng.gen_range(0..chars.len());
            let c = chars[idx];
            code.push(c);
        }
        code.push('-');
        for _ in 0..3 {
            let idx = rng.gen_range(0..chars.len());
            let c = chars[idx];
            code.push(c);
        }
        code
    }
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_invite_code() {
        let code = InviteCode::generate_invite_code();
        assert_eq!(code.len(), 7);
        assert_eq!(code.chars().nth(3).unwrap(), '-');

        println!("code: {}", code);
    }
}
