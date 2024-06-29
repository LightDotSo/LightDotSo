// Copyright 2023-2024 Light.
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

use crate::{
    namespace::{
        ERROR_TRANSACTION, RETRY_TRANSACTION, RETRY_TRANSACTION_0, RETRY_TRANSACTION_1,
        RETRY_TRANSACTION_2, TRANSACTION,
    },
    produce_message,
};
use eyre::Result;
pub use rdkafka;
use rdkafka::producer::FutureProducer;
use std::sync::Arc;

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with Transaction topic.
pub async fn produce_transaction_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, TRANSACTION.as_str(), message, None).await?;
    Ok(())
}

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with retry Transaction topic.
pub async fn produce_retry_transaction_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION.as_str(), message, None).await?;
    Ok(())
}

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with retry Transaction 0 topic.
pub async fn produce_retry_transaction_0_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION_0.as_str(), message, None).await?;
    Ok(())
}

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with retry Transaction 1 topic.
pub async fn produce_retry_transaction_1_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION_1.as_str(), message, None).await?;
    Ok(())
}

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with retry Transaction 2 topic.
pub async fn produce_retry_transaction_2_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION_2.as_str(), message, None).await?;
    Ok(())
}

// -----------------------------------------------------------------------------
// Producer
// -----------------------------------------------------------------------------

/// Produce a message with error Transaction topic.
pub async fn produce_error_transaction_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, ERROR_TRANSACTION.as_str(), message, None).await?;
    Ok(())
}
