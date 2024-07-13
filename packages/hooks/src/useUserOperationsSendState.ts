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

import { useMutationStateUserOperationSend } from "@lightdotso/query";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useUserOperationsSendState = () => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const userOperationSendStatus = useMutationStateUserOperationSend();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Check if the userOperation is loading and there is only one status
  const isUserOperationsSendLoadingSingle = useMemo(() => {
    return (
      userOperationSendStatus?.length === 1 &&
      userOperationSendStatus[0] === "pending"
    );
  }, [userOperationSendStatus]);

  // Check if the userOperations are all loading
  const isUserOperationsSendLoading = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "pending");
  }, [userOperationSendStatus]);

  // Check if the userOperations are all successful
  const isUserOperationsSendSuccess = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "success");
  }, [userOperationSendStatus]);

  // Check if the userOperations are all failed
  const isUserOperationsSendError = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "error");
  }, [userOperationSendStatus]);

  // Check if the userOperations are all idle
  const isUserOperationsSendIdle = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "idle");
  }, [userOperationSendStatus]);

  return {
    isUserOperationsSendLoadingSingle: isUserOperationsSendLoadingSingle,
    isUserOperationsSendLoading: isUserOperationsSendLoading,
    isUserOperationsSendSuccess: isUserOperationsSendSuccess,
    isUserOperationsSendError: isUserOperationsSendError,
    isUserOperationsSendIdle: isUserOperationsSendIdle,
  };
};
