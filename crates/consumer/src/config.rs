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

use crate::consumer::Consumer;
use clap::Parser;
use eyre::Result;
use lightdotso_kafka::namespace::TRANSACTION;
use lightdotso_tracing::tracing::info;

#[derive(Debug, Clone, Parser, Default)]
pub struct ConsumerArgs {
    /// The topics to consume.
    #[arg(long, short, num_args = 1.., value_delimiter = ',')]
    #[clap(long, env = "KAFKA_TOPICS")]
    pub topics: Vec<String>,
}

impl ConsumerArgs {
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("ConsumerArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        let consumer = Consumer::new(self).await;

        consumer.run().await;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_config_values() {
        // Reset the env vars
        env::remove_var("KAFKA_GROUP");
        env::remove_var("KAFKA_TOPICS");

        // Create a Config with default values
        let config_args = ConsumerArgs::parse_from([""]);

        // Verify the default values
        assert_eq!(config_args.topics, vec![] as Vec<String>);

        // Set some env vars
        env::set_var("KAFKA_TOPICS", "transaction");

        // Create a Config with env values
        let config_args = ConsumerArgs::parse_from([""]);

        // Verify the new values from env
        assert_eq!(config_args.topics, vec![TRANSACTION.to_string()]);

        // Reset the env vars
        env::remove_var("KAFKA_GROUP");
        env::remove_var("KAFKA_TOPICS");
    }

    #[test]
    fn test_config_default_values() {
        // Create a Config with default values
        let config_args = ConsumerArgs::default();

        // Verify the default values
        assert_eq!(config_args.topics, vec![] as Vec<String>);
    }
}
