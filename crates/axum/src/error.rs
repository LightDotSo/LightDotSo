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
    configuration::ConfigurationError, feedback::FeedbackError, notification::NotificationError,
    paymaster::PaymasterError, paymaster_operation::PaymasterOperationError,
    portfolio::PortfolioError, signature::SignatureError, support_request::SupportRequestError,
    token::TokenError, token_price::TokenPriceError, transaction::TransactionError,
    user::UserError, user_operation::UserOperationError, wallet::WalletError,
    wallet_settings::WalletSettingsError,
};
use http::StatusCode;

#[allow(clippy::enum_variant_names)]
#[allow(dead_code)]
pub(crate) enum RouteError {
    ConfigurationError(ConfigurationError),
    FeedbackError(FeedbackError),
    NotificationError(NotificationError),
    PaymasterError(PaymasterError),
    PaymasterOperationError(PaymasterOperationError),
    PortfolioError(PortfolioError),
    SignatureError(SignatureError),
    SupportRequestError(SupportRequestError),
    TokenPriceError(TokenPriceError),
    TokenError(TokenError),
    TransactionError(TransactionError),
    UserOperationError(UserOperationError),
    UserError(UserError),
    WalletSettingsError(WalletSettingsError),
    WalletError(WalletError),
}

pub trait RouteErrorStatusCodeAndMsg {
    fn error_status_code_and_msg(&self) -> (StatusCode, String);
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

impl RouteErrorStatusCodeAndMsg for NotificationError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            NotificationError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            NotificationError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
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

impl RouteErrorStatusCodeAndMsg for SignatureError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            SignatureError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            SignatureError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
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

impl RouteErrorStatusCodeAndMsg for TokenPriceError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            TokenPriceError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            TokenPriceError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
        }
    }
}

impl RouteErrorStatusCodeAndMsg for TokenError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            TokenError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            TokenError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
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

impl RouteErrorStatusCodeAndMsg for WalletSettingsError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            WalletSettingsError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.to_string()),
            WalletSettingsError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.to_string()),
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

impl RouteErrorStatusCodeAndMsg for RouteError {
    fn error_status_code_and_msg(&self) -> (StatusCode, String) {
        match self {
            RouteError::ConfigurationError(err) => err.error_status_code_and_msg(),
            RouteError::FeedbackError(err) => err.error_status_code_and_msg(),
            RouteError::NotificationError(err) => err.error_status_code_and_msg(),
            RouteError::PaymasterError(err) => err.error_status_code_and_msg(),
            RouteError::PaymasterOperationError(err) => err.error_status_code_and_msg(),
            RouteError::PortfolioError(err) => err.error_status_code_and_msg(),
            RouteError::SignatureError(err) => err.error_status_code_and_msg(),
            RouteError::SupportRequestError(err) => err.error_status_code_and_msg(),
            RouteError::TokenPriceError(err) => err.error_status_code_and_msg(),
            RouteError::TokenError(err) => err.error_status_code_and_msg(),
            RouteError::TransactionError(err) => err.error_status_code_and_msg(),
            RouteError::UserOperationError(err) => err.error_status_code_and_msg(),
            RouteError::UserError(err) => err.error_status_code_and_msg(),
            RouteError::WalletSettingsError(err) => err.error_status_code_and_msg(),
            RouteError::WalletError(err) => err.error_status_code_and_msg(),
        }
    }
}
