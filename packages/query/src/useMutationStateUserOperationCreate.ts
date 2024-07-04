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
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationStateUserOperationCreate = () => {
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

  const userOperationCreateStatus = useMutationState({
    filters: {
      mutationKey: ["userOperationCreate"],
      exact: true,
    },
    select: mutations => mutations.state.status,
  });

  const userOperationCreateBatchStatus = useMutationState({
    filters: {
      mutationKey: ["userOperationCreateBatch"],
      exact: true,
    },
    select: mutations => mutations.state.status,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------
  const isSignMessageAsyncLoading = useMemo(() => {
    return signMessageStatus?.some(status => status === "pending");
  }, [signMessageStatus]);

  const isUserOperationCreateLoading = useMemo(() => {
    return userOperationCreateStatus?.some(status => status === "pending");
  }, [userOperationCreateStatus]);

  const isUserOperationCreateBatchLoading = useMemo(() => {
    return userOperationCreateBatchStatus?.some(status => status === "pending");
  }, [userOperationCreateBatchStatus]);

  // Check if the userOperation is loading
  const isMutationStateUserOperationCreateLoading = useMemo(() => {
    return (
      isSignMessageAsyncLoading ||
      isUserOperationCreateLoading ||
      isUserOperationCreateBatchLoading
    );
  }, [
    isSignMessageAsyncLoading,
    isUserOperationCreateLoading,
    isUserOperationCreateBatchLoading,
  ]);

  // Check if the userOperation is successful
  const isMutationStateUserOperationCreateSuccess = useMemo(() => {
    return (
      userOperationCreateStatus?.some(status => status === "success") ||
      userOperationCreateBatchStatus?.some(status => status === "success")
    );
  }, [userOperationCreateStatus, userOperationCreateBatchStatus]);

  // Check if the userOperation is failed
  const isMutationStateUserOperationCreateError = useMemo(() => {
    return (
      userOperationCreateStatus?.some(status => status === "error") ||
      userOperationCreateBatchStatus?.some(status => status === "error")
    );
  }, [userOperationCreateStatus, userOperationCreateBatchStatus]);

  return {
    isMutationStateUserOperationCreateLoading:
      isMutationStateUserOperationCreateLoading,
    isMutationStateUserOperationCreateSuccess:
      isMutationStateUserOperationCreateSuccess,
    isMutationStateUserOperationCreateError:
      isMutationStateUserOperationCreateError,
  };
};
