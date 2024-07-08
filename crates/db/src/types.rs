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

use crate::error::DbError;
use axum::Json;
use lightdotso_prisma::PrismaClient;
use std::sync::Arc;

pub type Database = Arc<PrismaClient>;
pub type AppResult<T> = Result<T, DbError>;
pub type AppJsonResult<T> = AppResult<Json<T>>;
