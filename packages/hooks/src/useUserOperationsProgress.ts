import type { UserOperation } from "@lightdotso/schemas";
import { useUserOperations } from "@lightdotso/stores";
import { useMemo } from "react";

export const useUserOperationsProgress = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { partialUserOperations, userOperations } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const progressUserOperations: Partial<UserOperation>[] = useMemo(() => {
    // Return the concatenated partial user operations and user operations
    // to display the transaction details.
    // However, filter out the operations that are the same chainId and nonce

    const duplicatePartialUserOperations = partialUserOperations.filter(
      partialUserOperation =>
        userOperations.some(
          userOperation =>
            (userOperation.chainId === partialUserOperation.chainId &&
              userOperation.nonce === partialUserOperation.nonce) ||
            (userOperation.chainId === partialUserOperation.chainId &&
              partialUserOperation.nonce === undefined),
        ),
    );

    // Remove the duplicate partial user operations from the partial user operations
    // to prevent duplicate transaction details.
    const filteredPartialUserOperations = partialUserOperations.filter(
      partialUserOperation =>
        !duplicatePartialUserOperations.includes(partialUserOperation),
    );

    return [...filteredPartialUserOperations, ...userOperations];
  }, [partialUserOperations, userOperations]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return { progressUserOperations: progressUserOperations };
};
