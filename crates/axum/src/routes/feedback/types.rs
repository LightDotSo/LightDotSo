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

use lightdotso_prisma::feedback;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Feedback root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Feedback {
    /// The text of the feedback.
    pub text: String,
    /// The emoji of the feedback.
    pub emoji: String,
}

/// Implement From<feedback::Data> for Feedback.
impl From<feedback::Data> for Feedback {
    fn from(feedback: feedback::Data) -> Self {
        Self { text: feedback.text, emoji: feedback.emoji }
    }
}
