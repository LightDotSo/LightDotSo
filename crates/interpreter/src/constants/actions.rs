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
use strum_macros::EnumVariantNames;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, EnumVariantNames)]
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
}
