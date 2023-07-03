use axum::{routing::get, Router};
use anyhow::Result;

pub async fn start_server() ->  Result<()>  {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }));

    let socket_addr = "0.0.0.0:3002".parse()?;
    axum::Server::bind(&socket_addr).serve(app.into_make_service()).await?;

    Ok(())
}

#[tokio::main]
pub async fn main() -> Result<(), anyhow::Error> {
    start_server().await?;
    Ok(())
}
