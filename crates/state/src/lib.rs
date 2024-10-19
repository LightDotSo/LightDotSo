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

use eyre::Result;
use lightdotso_db::db::{create_client, create_postgres_client};
use lightdotso_hyper::{get_hyper_client, HyperClient};
use lightdotso_kafka::{get_producer, rdkafka::producer::FutureProducer};
use lightdotso_prisma::PrismaClient;
use lightdotso_redis::{get_redis_client, redis::Client};
use lightdotso_sqlx::PostgresPool;
use std::sync::Arc;

// -----------------------------------------------------------------------------
// Structs
// -----------------------------------------------------------------------------

#[derive(Clone)]
pub struct ClientState {
    pub hyper: Arc<HyperClient>,
    pub client: Arc<PrismaClient>,
    pub producer: Arc<FutureProducer>,
    pub pool: Arc<PostgresPool>,
    pub redis: Arc<Client>,
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

pub async fn create_client_state() -> Result<ClientState> {
    let hyper = Arc::new(get_hyper_client()?);
    let client = Arc::new(create_client().await?);
    let pool = Arc::new(create_postgres_client().await?);
    let producer = Arc::new(get_producer()?);
    let redis = Arc::new(get_redis_client()?);

    Ok(ClientState { hyper, client, producer, pool, redis })
}
