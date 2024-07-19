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

import { UserOperation } from "@lightdotso/schemas";
import { useAuth, useUserOperations } from "@lightdotso/stores";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { userOperationsParser } from "@lightdotso/nuqs";
import { toast } from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type CreateProps = {
  userOperations: Partial<UserOperation>[];
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useCreate = ({ userOperations }: CreateProps) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet, isAddressPath } = useAuth();
  const { setPartialUserOperations } = useUserOperations();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(() => {
    const rootPath = isAddressPath
      ? `/${wallet}/create`
      : `/create?address=${wallet}`;

    if (wallet && userOperations && userOperations.length > 0) {
      const userOperationsQueryState =
        userOperationsParser.serialize(userOperations);

      // If the query state is too large, set the user operations and push without query state params
      if (userOperationsQueryState.length > 2_000) {
        // Set the user operations
        setPartialUserOperations(userOperations);

        // Push without query state params
        router.push(rootPath);
        return;
      }

      // Push with query state params
      router.push(`${rootPath}&userOperations=${userOperationsQueryState}`);
      return;
    }

    // If there are no user operations, toast an error
    toast.error("No user operations to create!");
  }, [isAddressPath, wallet, userOperations]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return { handleCreate: handleCreate };
};
