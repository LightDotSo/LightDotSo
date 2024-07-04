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

import {
  useMutationStateSignMessage,
  useMutationStateUserOperationCreate,
  useMutationStateUserOperationCreateBatch,
} from "@lightdotso/query";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useUserOperationsCreateState = () => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const signMessageStatus = useMutationStateSignMessage();
  const userOperationCreateStatus = useMutationStateUserOperationCreate();
  const userOperationCreateBatchStatus =
    useMutationStateUserOperationCreateBatch();

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
  const isUserOperationsCreateLoading = useMemo(() => {
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
  const isUserOperationsCreateSuccess = useMemo(() => {
    return (
      userOperationCreateStatus?.some(status => status === "success") ||
      userOperationCreateBatchStatus?.some(status => status === "success")
    );
  }, [userOperationCreateStatus, userOperationCreateBatchStatus]);

  // Check if the userOperation is failed
  const isUserOperationsCreateError = useMemo(() => {
    return (
      userOperationCreateStatus?.some(status => status === "error") ||
      userOperationCreateBatchStatus?.some(status => status === "error")
    );
  }, [userOperationCreateStatus, userOperationCreateBatchStatus]);

  return {
    isUserOperationsCreateLoading: isUserOperationsCreateLoading,
    isUserOperationsCreateSuccess: isUserOperationsCreateSuccess,
    isUserOperationsCreateError: isUserOperationsCreateError,
  };
};
