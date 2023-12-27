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
    namespace::PORTFOLIO, produce_message, traits::ToJson, types::portfolio::PortfolioMessage,
};
use eyre::Result;
pub use rdkafka;
use rdkafka::producer::FutureProducer;
use std::sync::Arc;

// Produce a message with Portfolio topic.
pub async fn produce_portfolio_message(
    producer: Arc<FutureProducer>,
    msg: &PortfolioMessage,
) -> Result<()> {
    let message = msg.to_json();

    produce_message(producer, PORTFOLIO.as_str(), &message, None).await?;
    Ok(())
}
