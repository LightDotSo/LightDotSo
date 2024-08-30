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

"use client";

import { useMutationQueueTransaction } from "@lightdotso/query";
import { type PendingTransaction, useTransactions } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { getEtherscanUrlWithChainId } from "@lightdotso/utils";
import { useWaitForTransactionReceipt } from "@lightdotso/wagmi/wagmi";
import { type FC, useEffect } from "react";

// -----------------------------------------------------------------------------
// Internal Component
// -----------------------------------------------------------------------------

const ProgressTransactionInternal: FC<PendingTransaction> = ({
  hash,
  chainId,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { queueTransaction } = useMutationQueueTransaction({
    isMinimal: true,
  });

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { removePendingTransaction } = useTransactions();

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash: hash,
    chainId: chainId,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isLoading) {
      toast.info("Transaction in progress...", {
        duration: Number.POSITIVE_INFINITY,
        id: hash,
        position: "top-right",
      });
    }
  }, [isLoading, hash]);

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss(hash);
      toast.success("Transaction successful!", {
        action: {
          label: "View",
          onClick: () => {
            window.open(
              `${getEtherscanUrlWithChainId(chainId)}/tx/${hash}`,
              "_blank",
            );
          },
        },
        position: "top-right",
      });
      removePendingTransaction(hash);
      queueTransaction({ chain_id: chainId, hash: hash });
    }
  }, [isSuccess, hash, chainId, removePendingTransaction, queueTransaction]);

  return null;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ProgressTransaction: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { pendingTransactions } = useTransactions();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return Object.values(pendingTransactions).map((tx) => (
    <ProgressTransactionInternal
      key={tx.hash}
      hash={tx.hash}
      chainId={tx.chainId}
    />
  ));
};
