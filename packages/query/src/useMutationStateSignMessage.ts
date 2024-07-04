// Copyright 2023-2024 Light, Inc.
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

import { useMutationState } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationStateSignMessage = () => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  // Get the global mutation state of the `useSignMessage` hook
  // There can be multiple hooks initialized, so we need to sync them
  // From: https://github.com/wevm/wagmi/blob/ba43ba24ab2608876da24d388295ec46faf727d4/packages/core/src/query/signMessage.ts#L18
  const signMessageStatus = useMutationState({
    filters: {
      mutationKey: ["signMessage"],
      exact: true,
    },
    // Get the first mutation state because only there is one unique `useSignMessage` hook
    select: mutations => mutations.state.status,
  });

  return signMessageStatus;
};
