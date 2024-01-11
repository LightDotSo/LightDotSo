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

use serde::{Deserialize, Serialize};
use strum_macros::{Display, EnumString, EnumVariantNames, IntoStaticStr};

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
    PartialEq,
    EnumVariantNames,
    Display,
    EnumString,
    IntoStaticStr,
)]
pub enum InterpretationActionType {
    #[strum(serialize = "NATIVE_RECEIVE")]
    NativeReceive,
    #[strum(serialize = "NATIVE_SEND")]
    NativeSend,
    #[strum(serialize = "ERC20_RECEIVE")]
    ERC20Receive,
    #[strum(serialize = "ERC20_SEND")]
    ERC20Send,
    #[strum(serialize = "ERC721_RECEIVE")]
    ERC721Receive,
    #[strum(serialize = "ERC721_SEND")]
    ERC721Send,
    #[strum(serialize = "ERC721_MINTED")]
    ERC721Minted,
    #[strum(serialize = "ERC721_BURNED")]
    ERC721Burned,
    #[strum(serialize = "ERC1155_RECEIVE")]
    ERC1155Receive,
    #[strum(serialize = "ERC1155_SEND")]
    ERC1155Send,
    #[strum(serialize = "ERC1155_MINTED")]
    ERC1155Minted,
    #[strum(serialize = "ERC1155_BURNED")]
    ERC1155Burned,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn test_to_string() {
        let action = InterpretationActionType::NativeReceive;
        let serialized_action = action.to_string();
        assert_eq!(serialized_action, "NATIVE_RECEIVE");
    }

    #[test]
    fn test_from_str() {
        let action_str = "NATIVE_RECEIVE";
        let deserialized_action: Result<InterpretationActionType, _> =
            InterpretationActionType::from_str(action_str);
        assert!(deserialized_action.is_ok());
        assert_eq!(deserialized_action.unwrap(), InterpretationActionType::NativeReceive);
    }

    #[test]
    fn test_round_trip() {
        let original = InterpretationActionType::NativeReceive;
        let serialized = original.to_string();
        let deserialized: Result<InterpretationActionType, _> =
            InterpretationActionType::from_str(&serialized);
        assert!(deserialized.is_ok());
        assert_eq!(original, deserialized.unwrap());
    }
}
