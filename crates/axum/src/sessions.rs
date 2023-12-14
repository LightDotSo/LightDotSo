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

#![allow(clippy::unwrap_used)]

use crate::{
    constants::{EXPIRATION_TIME_KEY, NONCE_KEY, USER_ID_KEY},
    error::RouteError,
    result::AppError,
    routes::auth::error::AuthError,
};
use async_trait::async_trait;
use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use lightdotso_redis::redis::{Client, Commands};
use std::{
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use time::OffsetDateTime;
use tower_sessions_core::{session::Id, Expiry, Session, SessionStore};

// Redis implementation of https://github.com/maxcountryman/tower-sessions/blob/3db1504b3f0adb41612b1b12d9d843986ddd4b72/redis-store/src/lib.rs
// License: MIT
// This is a copy of the original code, with the only difference being the use of `redis` instead of
// `fred`.

/// An error type for `RedisStore`.
#[derive(thiserror::Error, Debug)]
pub enum RedisStoreError {
    /// A variant to map to `redis::RedisError` errors.
    #[error("Redis error: {0}")]
    Redis(#[from] lightdotso_redis::redis::RedisError),

    /// A variant to map `serde_json` encode errors.
    #[error("Serde JSON encode error: {0}")]
    SerdeEncode(#[from] serde_json::Error),

    /// Add a eyre::Error variant.
    #[error("Eyre error: {0}")]
    Eyre(#[from] eyre::Error),
}

/// A Redis session store.
#[derive(Debug, Clone)]
pub struct RedisStore {
    client: Arc<Client>,
}

impl RedisStore {
    /// Create a new Redis store with the provided client.
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// use tower_sessions::RedisStore;
    ///
    /// # tokio_test::block_on(async {
    /// let client = RedisClient::default();
    ///
    /// let _ = client.connect();
    /// client.wait_for_connect().await.unwrap();
    ///
    /// let session_store = RedisStore::new(client);
    /// })
    /// ```
    pub fn new(client: Client) -> Self {
        Self { client: Arc::new(client) }
    }
}

#[async_trait]
impl SessionStore for RedisStore {
    type Error = RedisStoreError;

    async fn save(&self, session: &Session) -> Result<(), Self::Error> {
        // Serialize the session data
        let session_data = serde_json::to_string(&session)?;

        // Get the session expiry time (offset from the current time)
        let current_time = unix_timestamp()?;
        // Get the session expiry time (offset from the current time)
        let expire_seconds =
            OffsetDateTime::unix_timestamp(session.expiry_date()) as usize - current_time as usize;

        // Save the session data
        let mut conn = self.client.get_connection()?;
        let _: () = conn.set_ex(session.id().to_string(), session_data, expire_seconds)?;
        Ok(())
    }

    async fn load(&self, session_id: &Id) -> Result<Option<Session>, Self::Error> {
        // Load the session data
        let mut conn = self.client.get_connection()?;
        let data: Option<String> = conn.get(session_id.to_string())?;

        // Deserialize the session data
        match data {
            Some(data) => {
                let session: Session = serde_json::from_str(&data)?;
                Ok(Some(session))
            }
            None => Ok(None),
        }
    }

    async fn delete(&self, session_id: &Id) -> Result<(), Self::Error> {
        // Delete the session data
        let mut conn = self.client.get_connection()?;
        conn.del(session_id.to_string())?;

        Ok(())
    }
}

/// Get the current unix timestamp.
pub fn unix_timestamp() -> Result<u64, eyre::Error> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs())
}

/// Verify the session is valid.
pub(crate) fn verify_session(session: &Session) -> Result<(), AppError> {
    // The frontend must set a session expiry
    match session.get::<String>(&NONCE_KEY) {
        Ok(Some(_)) => {}
        // Invalid nonce
        Ok(None) | Err(_) => {
            return Err(AppError::AuthError("Failed to get nonce.".to_string()));
        }
    }
    let now = match unix_timestamp() {
        Ok(now) => now,
        Err(_) => {
            return Err(AppError::AuthError("Failed to get timestamp.".to_string()));
        }
    };

    // Verify the session has not expired
    match session.get::<u64>(&EXPIRATION_TIME_KEY) {
        Err(_) | Ok(None) => {
            return Err(AppError::AuthError("Failed to get expiration.".to_string()));
        }
        Ok(Some(ts)) => {
            if now > ts {
                return Err(AppError::AuthError("Session has expired.".to_string()));
            }
        }
    }

    // Verify that a user id is set
    match session.get::<String>(&USER_ID_KEY) {
        Ok(Some(_)) => {}
        // Invalid nonce
        Ok(None) | Err(_) => {
            return Err(AppError::AuthError("Failed to get user id.".to_string()));
        }
    }

    Ok(())
}

/// Update the session expiry to the current time.
pub(crate) fn update_session_expiry(session: &Session) -> Result<(), AppError> {
    // Make sure we don't inherit a dirty session expiry
    let ts = match unix_timestamp() {
        Ok(ts) => ts,
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to get unix timestamp.".to_string(),
            ))));
        }
    };

    // Add 3 weeks to the expiry
    let ts = ts + 1814400;

    // Insert the new expiration time into the session
    match session.insert(&EXPIRATION_TIME_KEY, ts) {
        Ok(_) => {}
        Err(_) => {
            return Err(AppError::RouteError(RouteError::AuthError(AuthError::InternalError(
                "Failed to set expiration.".to_string(),
            ))));
        }
    }

    // Update the session expiry
    let expiry = Expiry::AtDateTime(OffsetDateTime::from_unix_timestamp(ts as i64).unwrap());
    session.set_expiry(Some(expiry));

    Ok(())
}

/// Middleware to verify the session is valid.
pub async fn authenticated<B>(
    session: Session,
    // you can also add more extractors here but the last
    // extractor must implement `FromRequest` which
    // `Request` does
    request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let authenticated = verify_session(&session);

    match authenticated {
        Ok(_) => {
            let response = next.run(request).await;
            Ok(response)
        }
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}
