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

// Produce a message with Transaction topic.
pub async fn produce_transaction_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, TRANSACTION.as_str(), message, None).await?;
    Ok(())
}

// Produce a message with retry Transaction topic.
pub async fn produce_retry_transaction_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION.as_str(), message, None).await?;
    Ok(())
}

// Produce a message with retry Transaction 0 topic.
pub async fn produce_retry_transaction_0_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION_0.as_str(), message, None).await?;
    Ok(())
}

// Produce a message with retry Transaction 1 topic.
pub async fn produce_retry_transaction_1_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION_1.as_str(), message, None).await?;
    Ok(())
}

// Produce a message with retry Transaction 2 topic.
pub async fn produce_retry_transaction_2_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, RETRY_TRANSACTION_2.as_str(), message, None).await?;
    Ok(())
}

// Produce a message with error Transaction topic.
pub async fn produce_error_transaction_message(
    producer: Arc<FutureProducer>,
    message: &str,
) -> Result<()> {
    produce_message(producer, ERROR_TRANSACTION.as_str(), message, None).await?;
    Ok(())
}
