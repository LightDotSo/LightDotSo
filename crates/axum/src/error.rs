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

use crate::routes::{
    activity::error::ActivityError, asset_change::error::AssetChangeError, auth::error::AuthError,
    chain::error::ChainError, configuration::error::ConfigurationError,
    feedback::error::FeedbackError, interpretation::error::InterpretationError,
    interpretation_action::error::InterpretationActionError, invite_code::error::InviteCodeError,
    notification::error::NotificationError, owner::error::OwnerError,
    paymaster::error::PaymasterError, paymaster_operation::error::PaymasterOperationError,
    portfolio::error::PortfolioError, protocol::error::ProtocolError,
    protocol_group::error::ProtocolGroupError, queue::error::QueueError,
    signature::error::SignatureError, simulation::error::SimulationError,
    support_request::error::SupportRequestError, token::error::TokenError,
    token_group::error::TokenGroupError, token_price::error::TokenPriceError,
    transaction::error::TransactionError, user::error::UserError,
    user_operation::error::UserOperationError, wallet::error::WalletError,
    wallet_billing::error::WalletBillingError, wallet_features::error::WalletFeaturesError,
    wallet_settings::error::WalletSettingsError,
};
use http::StatusCode;

#[allow(clippy::enum_variant_names)]
#[allow(dead_code)]
pub(crate) enum RouteError {
    ActivityError(ActivityError),
    AssetChangeError(AssetChangeError),
    AuthError(AuthError),
    ChainError(ChainError),
    ConfigurationError(ConfigurationError),
    FeedbackError(FeedbackError),
    InterpretationError(InterpretationError),
    InterpretationActionError(InterpretationActionError),
    InviteCodeError(InviteCodeError),
    NotificationError(NotificationError),
    OwnerError(OwnerError),
    PaymasterError(PaymasterError),
    PaymasterOperationError(PaymasterOperationError),
    PortfolioError(PortfolioError),
    ProtocolError(ProtocolError),
    ProtocolGroupError(ProtocolGroupError),
    QueueError(QueueError),
    SignatureError(SignatureError),
    SimulationError(SimulationError),
    SupportRequestError(SupportRequestError),
    TokenError(TokenError),
    TokenGroupError(TokenGroupError),
    TokenPriceError(TokenPriceError),
    TransactionError(TransactionError),
    UserOperationError(UserOperationError),
    UserError(UserError),
    WalletError(WalletError),
    WalletBillingError(WalletBillingError),
    WalletFeaturesError(WalletFeaturesError),
    WalletSettingsError(WalletSettingsError),
}

pub trait RouteErrorStatusCodeAndMsg {
    fn error_status_code_and_msg(&self) -> (StatusCode, String);
}

impl RouteErrorStatusCodeAndMsg for ActivityError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            ActivityError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            ActivityError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for AssetChangeError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            AssetChangeError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            AssetChangeError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for AuthError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            AuthError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            AuthError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            AuthError::InternalError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.to_string()),
            AuthError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for ChainError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            ChainError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            ChainError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            ChainError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for ConfigurationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            ConfigurationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            ConfigurationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for FeedbackError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            FeedbackError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            FeedbackError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for InterpretationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            InterpretationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            InterpretationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for InterpretationActionError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            InterpretationActionError::BadRequest(msg) => {
                (StatusCode::BAD_REQUEST, msg.to_string())
            }
            InterpretationActionError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for InviteCodeError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            InviteCodeError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            InviteCodeError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            InviteCodeError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for NotificationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            NotificationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            NotificationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for OwnerError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            OwnerError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            OwnerError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for PaymasterOperationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            PaymasterOperationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            PaymasterOperationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for PaymasterError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            PaymasterError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            PaymasterError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for PortfolioError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            PortfolioError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            PortfolioError::Conflict(msg) => (StatusCode::CONFLICT, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for ProtocolError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            ProtocolError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            ProtocolError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for ProtocolGroupError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            ProtocolGroupError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            ProtocolGroupError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            ProtocolGroupError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for QueueError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            QueueError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            QueueError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            QueueError::RateLimitExceeded(msg) => (StatusCode::TOO_MANY_REQUESTS, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for SignatureError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            SignatureError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            SignatureError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for SimulationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            SimulationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            SimulationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for SupportRequestError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            SupportRequestError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            SupportRequestError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for TokenError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            TokenError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            TokenError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            TokenError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for TokenGroupError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            TokenGroupError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            TokenGroupError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            TokenGroupError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for TokenPriceError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            TokenPriceError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            TokenPriceError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for TransactionError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            TransactionError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            TransactionError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for UserOperationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            UserOperationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            UserOperationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for UserError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            UserError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            UserError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for WalletError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            WalletError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            WalletError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            WalletError::Conflict(msg) => (StatusCode::CONFLICT, msg.to_string()),
            WalletError::InvalidConfiguration(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for WalletBillingError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            WalletBillingError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            WalletBillingError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            WalletBillingError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for WalletFeaturesError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            WalletFeaturesError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            WalletFeaturesError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
            WalletFeaturesError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for WalletSettingsError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            WalletSettingsError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            WalletSettingsError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for RouteError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            RouteError::ActivityError(err) => err.error_status_code_and_msg(),
            RouteError::AssetChangeError(err) => err.error_status_code_and_msg(),
            RouteError::AuthError(err) => err.error_status_code_and_msg(),
            RouteError::ChainError(err) => err.error_status_code_and_msg(),
            RouteError::ConfigurationError(err) => err.error_status_code_and_msg(),
            RouteError::FeedbackError(err) => err.error_status_code_and_msg(),
            RouteError::InterpretationError(err) => err.error_status_code_and_msg(),
            RouteError::InterpretationActionError(err) => err.error_status_code_and_msg(),
            RouteError::InviteCodeError(err) => err.error_status_code_and_msg(),
            RouteError::NotificationError(err) => err.error_status_code_and_msg(),
            RouteError::OwnerError(err) => err.error_status_code_and_msg(),
            RouteError::PaymasterError(err) => err.error_status_code_and_msg(),
            RouteError::PaymasterOperationError(err) => err.error_status_code_and_msg(),
            RouteError::PortfolioError(err) => err.error_status_code_and_msg(),
            RouteError::ProtocolError(err) => err.error_status_code_and_msg(),
            RouteError::ProtocolGroupError(err) => err.error_status_code_and_msg(),
            RouteError::QueueError(err) => err.error_status_code_and_msg(),
            RouteError::SignatureError(err) => err.error_status_code_and_msg(),
            RouteError::SimulationError(err) => err.error_status_code_and_msg(),
            RouteError::SupportRequestError(err) => err.error_status_code_and_msg(),
            RouteError::TokenError(err) => err.error_status_code_and_msg(),
            RouteError::TokenGroupError(err) => err.error_status_code_and_msg(),
            RouteError::TokenPriceError(err) => err.error_status_code_and_msg(),
            RouteError::TransactionError(err) => err.error_status_code_and_msg(),
            RouteError::UserOperationError(err) => err.error_status_code_and_msg(),
            RouteError::UserError(err) => err.error_status_code_and_msg(),
            RouteError::WalletError(err) => err.error_status_code_and_msg(),
            RouteError::WalletBillingError(err) => err.error_status_code_and_msg(),
            RouteError::WalletFeaturesError(err) => err.error_status_code_and_msg(),
            RouteError::WalletSettingsError(err) => err.error_status_code_and_msg(),
        }
    }
}
