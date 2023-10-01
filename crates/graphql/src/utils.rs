use crate::constants::THE_GRAPH_HOSTED_SERVICE_URLS;
use eyre::Result;

/// A helper function to get the graphql url for a given chain id.
pub fn get_graphql_url(chain_id: u64) -> Result<String> {
    let url = THE_GRAPH_HOSTED_SERVICE_URLS
        .get(&chain_id)
        .ok_or_else(|| eyre::eyre!("Chain id {} not supported", chain_id))?;
    Ok(url.to_string())
}
