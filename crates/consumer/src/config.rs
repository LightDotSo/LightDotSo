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

use crate::consumer::Consumer;
use clap::Parser;
use eyre::Result;
use lightdotso_tracing::tracing::info;

#[derive(Clone, Debug, Parser, Default)]
pub struct ConsumerArgs {
    /// The group id of the consumer.
    #[arg(long, short, default_value_t = String::from(""))]
    #[clap(long, env = "KAFKA_GROUP")]
    pub group: String,
    /// The topics to consume.
    #[arg(long, short, num_args = 1.., value_delimiter = ',')]
    #[clap(long, env = "KAFKA_TOPICS")]
    pub topics: Vec<String>,
    /// The number of consumers to spawn.
    /// Defaults to 4x the number of CPUs.
    #[arg(long, short, default_value = "4")]
    #[clap(long, env = "CONSUMER_CPU_MULTIPLIER")]
    pub cpu_multiplier: usize,
}

impl ConsumerArgs {
    pub async fn run(&self) -> Result<()> {
        // Add info
        info!("ConsumerArgs run, starting...");

        // Print the config
        info!("Config: {:?}", self);

        let consumer = Consumer::new(self).await?;

        consumer.run().await?;

        Ok(())
    }
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

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
        assert_eq!(config_args.group, "");
        assert_eq!(config_args.topics, vec![] as Vec<String>);

        // Set some env vars
        env::set_var("KAFKA_GROUP", "one");
        env::set_var("KAFKA_TOPICS", "hello,world");

        // Create a Config with env values
        let config_args = ConsumerArgs::parse_from([""]);

        // Verify the new values from env
        assert_eq!(config_args.group, "one");
        assert_eq!(config_args.topics, vec!["hello", "world"]);

        // Reset the env vars
        env::remove_var("KAFKA_GROUP");
        env::remove_var("KAFKA_TOPICS");
    }

    #[test]
    fn test_config_default_values() {
        // Create a Config with default values
        let config_args = ConsumerArgs::default();

        // Verify the default values
        assert_eq!(config_args.group, "");
        assert_eq!(config_args.topics, vec![] as Vec<String>);
    }
}
