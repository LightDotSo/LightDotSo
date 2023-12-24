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
