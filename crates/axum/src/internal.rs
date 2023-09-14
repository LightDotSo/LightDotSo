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

use autometrics::prometheus_exporter;
use axum::Router;
use eyre::Result;

pub async fn start_internal_server() -> Result<()> {
    prometheus_exporter::init();

    let app = Router::new()
        .merge(crate::routes::health::router())
        .merge(crate::routes::metrics::router());

    let socket_addr = "0.0.0.0:9091".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}
