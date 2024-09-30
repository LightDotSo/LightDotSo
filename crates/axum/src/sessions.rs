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
    constants::{NONCE_KEY, USER_ID_KEY},
    result::AppError,
};
use async_trait::async_trait;
use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use eyre::{eyre, Result};
use lightdotso_redis::redis::{
    self, Client, Commands, ExistenceCheck, RedisError, RedisResult, SetExpiry, SetOptions,
};
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
#[derive(Debug, thiserror::Error)]
pub enum RedisStoreError {
    #[error(transparent)]
    Redis(#[from] RedisError),

    #[error(transparent)]
    Decode(#[from] rmp_serde::decode::Error),

    #[error(transparent)]
    Encode(#[from] rmp_serde::encode::Error),
}

impl From<RedisStoreError> for session_store::Error {
    fn from(err: RedisStoreError) -> Self {
        match err {
            RedisStoreError::Redis(inner) => session_store::Error::Backend(inner.to_string()),
            RedisStoreError::Decode(inner) => session_store::Error::Decode(inner.to_string()),
            RedisStoreError::Encode(inner) => session_store::Error::Encode(inner.to_string()),
        }
    }
}

/// A Redis session store.
#[derive(Debug, Clone)]
pub struct RedisStore {
    client: Arc<Client>,
}

impl RedisStore {
    /// Create a new Redis store with the provided client.
    pub fn new(client: Client) -> Self {
        Self { client: Arc::new(client) }
    }

    /// Save the session with the provided options.
    ///
    /// If `nx` is true, the session will only be saved if it does not already exist.
    /// If `nx` is false, the session will only be saved if it already exists.
    fn save_with_options(&self, record: &Record, nx: bool) -> RedisResult<bool> {
        // Get the connection
        let mut conn = self.client.get_connection()?;

        // Get the current time
        let now = OffsetDateTime::now_utc();
        let expire_seconds = (record.expiry_date - now).whole_seconds().max(0) as u64;

        // Serialize the record
        let data = rmp_serde::to_vec(record).map_err(|e| {
            RedisError::from((
                redis::ErrorKind::ParseError,
                "Failed to serialize record",
                e.to_string(),
            ))
        })?;

        // Set the options
        let mut opts = SetOptions::default().with_expiration(SetExpiry::EX(expire_seconds));
        if nx {
            opts = opts.conditional_set(ExistenceCheck::NX);
        } else {
            opts = opts.conditional_set(ExistenceCheck::XX);
        }
        conn.set_options(record.id.to_string(), data, opts)
    }
}

#[async_trait]
impl SessionStore for RedisStore {
    /// Create a new session.
    async fn create(&self, record: &mut Record) -> session_store::Result<()> {
        // Create the record
        loop {
            match self.save_with_options(record, true) {
                Ok(true) => break,
                Ok(false) => {
                    record.id = Id::default();
                    continue;
                }
                Err(e) => return Err(RedisStoreError::Redis(e).into()),
            }
        }
        Ok(())
    }

    /// Save the session.
    async fn save(&self, record: &Record) -> session_store::Result<()> {
        // Save the record
        self.save_with_options(record, false).map_err(RedisStoreError::Redis)?;
        Ok(())
    }

    /// Load the session.
    async fn load(&self, session_id: &Id) -> session_store::Result<Option<Record>> {
        // Get the connection
        let mut conn = self.client.get_connection().map_err(RedisStoreError::Redis)?;

        // Get the data
        let data: Option<Vec<u8>> =
            conn.get(session_id.to_string()).map_err(RedisStoreError::Redis)?;

        // Parse the data
        if let Some(data) = data {
            let record: Record = rmp_serde::from_slice(&data)
                .map_err(|e| session_store::Error::Decode(e.to_string()))?;
            Ok(Some(record))
        } else {
            Ok(None)
        }
    }

    /// Delete the session.
    async fn delete(&self, session_id: &Id) -> session_store::Result<()> {
        // Get the connection
        let mut conn = self.client.get_connection().map_err(RedisStoreError::Redis)?;

        // Delete the data
        conn.del(session_id.to_string()).map_err(RedisStoreError::Redis)?;
        Ok(())
    }
}

/// Get the current unix timestamp.
pub fn unix_timestamp() -> Result<u64, eyre::Error> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs())
}

/// Verify the session is valid.
pub(crate) async fn verify_session(session: &Session) -> Result<(), AppError> {
    // Check for nonce
    if session
        .get::<String>(&NONCE_KEY)
        .await
        .map_err(|e| AppError::AuthError(format!("Failed to get nonce: {}", e)))?
        .is_none()
    {
        return Err(AppError::AuthError("Nonce not found in session.".to_string()));
    }

    // Check for user ID
    if session
        .get::<String>(&USER_ID_KEY)
        .await
        .map_err(|e| AppError::AuthError(format!("Failed to get user id: {}", e)))?
        .is_none()
    {
        return Err(AppError::AuthError("User ID not found in session.".to_string()));
    }

    // Check for expiration
    let expiry = session.expiry_date();
    let now = OffsetDateTime::now_utc();
    if now > expiry {
        return Err(AppError::AuthError("Session has expired.".to_string()));
    }

    Ok(())
}

/// Update the session expiry to the current time.
pub(crate) async fn update_session_expiry(session: &Session) -> Result<(), AppError> {
    // Set the new session expiry to 3 weeks from now
    let new_expiry = OffsetDateTime::now_utc() + time::Duration::weeks(3);

    // Set the session expiry
    session.set_expiry(Some(Expiry::AtDateTime(new_expiry)));

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
