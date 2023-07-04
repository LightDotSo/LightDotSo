use anyhow::Result;
use axum::{routing::get, Router};

async fn health_check() -> &'static str {
    "OK"
}

pub async fn start_server() -> Result<()> {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/health", get(health_check));

    let socket_addr = "0.0.0.0:3002".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}

#[tokio::main]
pub async fn main() -> Result<(), anyhow::Error> {
    start_server().await?;
    Ok(())
}
