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

import {
  useMutationStateSignMessage,
  useMutationStateUserOperationCreate,
  useMutationStateUserOperationCreateBatch,
} from "@lightdotso/query";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Hook
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

  // Check if the signMessage is loading
  const isSignMessageAsyncLoading = useMemo(() => {
    return signMessageStatus?.some((status) => status === "pending");
  }, [signMessageStatus]);

  // Check if the userOperation is loading and there is only one status
  const isUserOperationCreateLoadingSingle = useMemo(() => {
    return (
      userOperationCreateStatus?.length === 1 &&
      userOperationCreateStatus[0] === "pending"
    );
  }, [userOperationCreateStatus]);

  // Check if the userOperations are all loading
  const isUserOperationCreateLoading = useMemo(() => {
    return userOperationCreateStatus?.some((status) => status === "pending");
  }, [userOperationCreateStatus]);

  // Check if the userOperations are all loading
  const isUserOperationsCreateBatchLoading = useMemo(() => {
    return userOperationCreateBatchStatus?.some(
      (status) => status === "pending",
    );
  }, [userOperationCreateBatchStatus]);

  // Check if the userOperations are all loading
  const isUserOperationsCreateLoading = useMemo(() => {
    return (
      isSignMessageAsyncLoading ||
      isUserOperationCreateLoading ||
      isUserOperationsCreateBatchLoading
    );
  }, [
    isSignMessageAsyncLoading,
    isUserOperationCreateLoading,
    isUserOperationsCreateBatchLoading,
  ]);

  // Check if the userOperations are all successful
  const isUserOperationsCreateSuccess = useMemo(() => {
    return (
      userOperationCreateStatus?.some((status) => status === "success") ||
      userOperationCreateBatchStatus?.some((status) => status === "success")
    );
  }, [userOperationCreateStatus, userOperationCreateBatchStatus]);

  // Check if the userOperations are all failed
  const isUserOperationsCreateError = useMemo(() => {
    return (
      userOperationCreateStatus?.some((status) => status === "error") ||
      userOperationCreateBatchStatus?.some((status) => status === "error")
    );
  }, [userOperationCreateStatus, userOperationCreateBatchStatus]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    isUserOperationCreateLoadingSingle: isUserOperationCreateLoadingSingle,
    isUserOperationsCreateLoading: isUserOperationsCreateLoading,
    isUserOperationsCreateSuccess: isUserOperationsCreateSuccess,
    isUserOperationsCreateError: isUserOperationsCreateError,
  };
};
