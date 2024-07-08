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

use crate::constants::{USER_COOKIE_ID, WALLET_COOKIE_ID};
use async_trait::async_trait;
use time::Duration;
use tower_cookies::{cookie::SameSite, Cookie, Cookies};

/// A trait for adding cookies to the response.
#[async_trait]
pub trait CookieUtility {
    // Generic handler to add a cookie to the response.
    async fn add_cookie(&self, name: String, value: String);

    // Generic handler to remove a cookie from the response.
    async fn remove_cookie(&self, name: String);

    // Add a wallet cookie to the response.
    async fn add_wallet_cookie(&self, address: String);

    // Add a user cookie to the response.
    async fn add_user_cookie(&self, address: String);

    // Remove a wallet cookie from the response.
    async fn remove_wallet_cookie(&self);

    // Remove a user cookie from the response.
    async fn remove_user_cookie(&self);
}

#[async_trait]
impl CookieUtility for Cookies {
    // Add a cookie to the response.
    async fn add_cookie(&self, name: String, value: String) {
        // Initialize a cookie builder.
        let mut cookie_builder = Cookie::build(name, value).path("/").max_age(Duration::weeks(3));

        // If deployed under fly.io, `FLY_APP_NAME` starts w/ `lightdotso-api`
        // then set the cookie domain to `.light.so` and secure to true.
        // Also set the same site to lax.
        if let Ok(fly_app_name) = std::env::var("FLY_APP_NAME") {
            if fly_app_name.starts_with("lightdotso-api") {
                cookie_builder = cookie_builder
                    .domain(".light.so".to_string())
                    .secure(true)
                    .same_site(SameSite::Lax);
            }
        }

        // Finish the cookie builder.
        let cookie = cookie_builder.finish();

        self.add(cookie);
    }

    // Remove a cookie from the response.
    async fn remove_cookie(&self, name: String) {
        self.remove(Cookie::new(name, ""));
    }

    // Add a wallet cookie to the response.
    async fn add_wallet_cookie(&self, address: String) {
        self.add_cookie(WALLET_COOKIE_ID.to_string(), address).await;
    }

    // Add a user cookie to the response.
    async fn add_user_cookie(&self, address: String) {
        self.add_cookie(USER_COOKIE_ID.to_string(), address).await;
    }

    // Remove a wallet cookie from the response.
    async fn remove_wallet_cookie(&self) {
        self.remove_cookie(WALLET_COOKIE_ID.to_string()).await;
    }

    // Remove a user cookie from the response.
    async fn remove_user_cookie(&self) {
        self.remove_cookie(USER_COOKIE_ID.to_string()).await;
    }
}
