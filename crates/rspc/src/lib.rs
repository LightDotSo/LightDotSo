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

use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::info;
use rspc::{Config, Router, Type};
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Arc, thread::sleep, time::Duration};

#[derive(Debug, Clone)]
pub struct Context {
    pub db: Arc<PrismaClient>,
}

pub fn create_router() -> Router<Context> {
    Router::<Context>::new()
        .config(Config::new().set_ts_bindings_header("/* eslint-disable */").export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/types/bindings.ts"),
        ))
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
        .query("wallets", |t| {
            t(|ctx, _: ()| async move {
                let wallets = ctx.db.wallet().find_many(vec![]).exec().await?;

                Ok(wallets)
            })
        })
        // Subscriptions can also be used for server -> client real time events
        // Subscriptions have a slightly different syntax. You can respond with any Rust `Stream`
        // type.
        .subscription("pings", |t| {
            t(|_, _: ()| {
                async_stream::stream! {
                    for _i in 0..5 {
                        yield "ping".to_string();
                        sleep(Duration::from_secs(1));
                    }
                }
            })
        })
        .mutation("emptyWallets", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct EmptyInput {
                content: String,
            }
            t(|ctx, empty: EmptyInput| async move {
                info!("createPost: {:?}", empty);
                let wallets = ctx.db.wallet().find_many(vec![]).exec().await?;

                Ok(wallets)
            })
        })
        .build()
}
