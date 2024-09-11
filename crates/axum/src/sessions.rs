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

#![allow(clippy::unwrap_used)]

use crate::{
    constants::{EXPIRATION_TIME_KEY, NONCE_KEY, USER_ID_KEY},
    error::RouteError,
    result::AppError,
    routes::auth::error::AuthError,
};
use async_trait::async_trait;
use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use eyre::{eyre, Result};
use lightdotso_redis::redis::{Client, Commands};
use std::{
    fmt::Debug,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use time::OffsetDateTime;
use tower_sessions_core::{
    session::{Id, Record},
    session_store, Expiry, Session, SessionStore,
};

// Redis implementation of https://github.com/maxcountryman/tower-sessions/blob/3db1504b3f0adb41612b1b12d9d843986ddd4b72/redis-store/src/lib.rs
// Updated here at: https://github.com/maxcountryman/tower-sessions-stores/blob/d14bbc1ebd78e0d7d55c019aee54c83bab5fcf3e/redis-store/src/lib.rs
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
    async fn create(&self, record: &mut Record) -> session_store::Result<()> {
        // Run save
        self.save(record).await
    }

    async fn save(&self, record: &Record) -> session_store::Result<()> {
        // Serialize the session data
        let session_data =
            rmp_serde::to_vec(&record).map_err(|e| session_store::Error::Backend(e.to_string()))?;

        // Get the session expiry time (offset from the current time)
        let current_time =
            unix_timestamp().map_err(|e| session_store::Error::Backend(e.to_string()))?;
        // Get the session expiry time (offset from the current time)
        let expire_seconds =
            OffsetDateTime::unix_timestamp(record.expiry_date) - current_time as i64;

        // Save the session data
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| session_store::Error::Backend(e.to_string()))?;
        let _: () = conn
            .set_ex(record.id.to_string(), session_data, expire_seconds as u64)
            .map_err(|e| session_store::Error::Backend(e.to_string()))?;
        Ok(())
    }

    async fn load(&self, session_id: &Id) -> session_store::Result<Option<Record>> {
        // Load the session data
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| session_store::Error::Backend(e.to_string()))?;
        let data: Option<Vec<u8>> = conn
            .get(session_id.to_string())
            .map_err(|e| session_store::Error::Backend(e.to_string()))?;

        // Deserialize the session data
        match data {
            Some(data) => {
                let session: Record = rmp_serde::from_slice(&data)
                    .map_err(|e| session_store::Error::Backend(e.to_string()))?;
                Ok(Some(session))
            }
            None => Ok(None),
        }
    }

    async fn delete(&self, session_id: &Id) -> session_store::Result<()> {
        // Delete the session data
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| session_store::Error::Backend(e.to_string()))?;
        conn.del(session_id.to_string())
            .map_err(|e| session_store::Error::Backend(e.to_string()))?;

        Ok(())
    }
}

/// Get the current unix timestamp.
pub fn unix_timestamp() -> Result<u64, eyre::Error> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs())
}

/// Verify the session is valid.
pub(crate) async fn verify_session(session: &Session) -> Result<(), AppError> {
    // The frontend must set a session expiry
    match session.get::<String>(&NONCE_KEY).await {
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
    match session.get::<u64>(&EXPIRATION_TIME_KEY).await {
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
    match session.get::<String>(&USER_ID_KEY).await {
        Ok(Some(_)) => {}
        // Invalid nonce
        Ok(None) | Err(_) => {
            return Err(AppError::AuthError("Failed to get user id.".to_string()));
        }
    }

    Ok(())
}

/// Update the session expiry to the current time.
pub(crate) async fn update_session_expiry(session: &Session) -> Result<(), AppError> {
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
    match session.insert(&EXPIRATION_TIME_KEY, ts).await {
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
pub async fn authenticated(
    session: Session,
    // you can also add more extractors here but the last
    // extractor must implement `FromRequest` which
    // `Request` does
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let authenticated = verify_session(&session).await;

    match authenticated {
        Ok(_) => {
            let response = next.run(request).await;
            Ok(response)
        }
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}

/// Get the user id from the session.
pub async fn get_user_id(session: &mut Session) -> Result<String> {
    match session.get::<String>(&USER_ID_KEY).await {
        Ok(Some(user_id)) => {
            let user_id = user_id.to_lowercase();
            Ok(user_id)
        }
        _ => Err(eyre!("No user id found in session.")),
    }
}
