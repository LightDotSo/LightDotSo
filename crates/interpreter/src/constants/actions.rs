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
    #[strum(serialize = "ERC20_APPROVE")]
    ERC20Approve,
    #[strum(serialize = "ERC20_RECEIVE")]
    ERC20Receive,
    #[strum(serialize = "ERC20_SEND")]
    ERC20Send,
    #[strum(serialize = "ERC20_MINT")]
    ERC20Mint,
    #[strum(serialize = "ERC20_BURN")]
    ERC20Burn,
    #[strum(serialize = "ERC721_APPROVE")]
    ERC721Approve,
    #[strum(serialize = "ERC721_RECEIVE")]
    ERC721Receive,
    #[strum(serialize = "ERC721_SEND")]
    ERC721Send,
    #[strum(serialize = "ERC721_MINT")]
    ERC721Mint,
    #[strum(serialize = "ERC721_BURN")]
    ERC721Burn,
    #[strum(serialize = "ERC1155_APPROVE")]
    ERC1155Approve,
    #[strum(serialize = "ERC1155_RECEIVE")]
    ERC1155Receive,
    #[strum(serialize = "ERC1155_SEND")]
    ERC1155Send,
    #[strum(serialize = "ERC1155_MINT")]
    ERC1155Mint,
    #[strum(serialize = "ERC1155_BURN")]
    ERC1155Burn,
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
