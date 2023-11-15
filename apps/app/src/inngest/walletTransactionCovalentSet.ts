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

import { inngest } from "@/inngest/client";
import type { Chain } from "@covalenthq/client-sdk";
import { CovalentClient } from "@covalenthq/client-sdk";
import { ChainIdMapping } from "./walletPortfolioInvoke";
import { kafka } from "@/clients/kafka";

export const walletTransactionCovalentSet = inngest.createFunction(
  {
    id: "wallet-transaction-covalent-set",
    concurrency: {
      limit: 4,
    },
    debounce: {
      key: "event.data.address",
      period: "3s",
    },
    rateLimit: {
      key: "event.data.address",
      limit: 1,
      period: "1m",
    },
  },
  { event: "wallet/transaction.covalent.set" },
  async ({ event, step }) => {
    await step.run("Get Covalent", async () => {
      // Parse the chain names from the array of chainIds (e.g. [1, 137] => ["eth-mainnet", "matic-mainnet"])
      const chains = event.data.chainIds.map(chainId => {
        return ChainIdMapping[chainId] as Chain;
      });

      // Get the Covalent client for the given chain.
      const client = new CovalentClient(process.env.COVALENT_API_KEY!);
      const producer = kafka.producer();

      // For each chain, loop through the wallets and get the transaction.
      for (const chain of chains) {
        // Initialize page number
        let pageNumber = 0;

        // Initialize a flag to check if any data is available in the current page
        let dataAvailableInCurrentPage = false;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // Start an infinite loop that we break when no more pages
          // Get the transfers for the given chain.
          const transfers =
            await client.BalanceService.getErc20TransfersForWalletAddress(
              chain,
              event.data.address,
              {
                pageNumber: pageNumber, // Use current page number
              },
            );

          // Get the chainId from the event.data.chainIds array.
          const chainId = event.data.chainIds.find(chainId => {
            return ChainIdMapping[chainId] === chain;
          });

          // Create a new array with tuple of (block_number, chain_id)
          let blockNumbers: [number, number][] = [];

          for await (const item of transfers) {
            // Set flag to true if an item is available
            dataAvailableInCurrentPage = true;

            blockNumbers.push([item.block_height, chainId!]);
          }

          // If flag is still false, break the loop
          if (!dataAvailableInCurrentPage) {
            break;
          }

          // Prepare the data for production
          const dataToProduce = blockNumbers.map(blockNumber => ({
            topic: "transaction",
            value: JSON.stringify({
              block_number: blockNumber[0],
              chain_id: blockNumber[1],
            }),
          }));

          // Produce the data
          await producer.produceMany(dataToProduce);

          // Increment the page number after processed page
          pageNumber++;
        }
      }
    });
  },
);
