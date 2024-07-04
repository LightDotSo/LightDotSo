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

import { useMutationStateUserOperationSend } from "@lightdotso/query";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useUserOperationsSendState = () => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const userOperationSendStatus = useMutationStateUserOperationSend();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Check if the userOperation is loading
  const isUserOperationsSendLoading = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "pending");
  }, [userOperationSendStatus]);

  // Check if the userOperation is successful
  const isUserOperationsSendSuccess = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "success");
  }, [userOperationSendStatus]);

  // Check if the userOperation is failed
  const isUserOperationsSendError = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "error");
  }, [userOperationSendStatus]);

  // Check if the userOperation is idle
  const isUserOperationsSendIdle = useMemo(() => {
    return userOperationSendStatus?.some(status => status === "idle");
  }, [userOperationSendStatus]);

  return {
    isUserOperationsSendLoading: isUserOperationsSendLoading,
    isUserOperationsSendSuccess: isUserOperationsSendSuccess,
    isUserOperationsSendError: isUserOperationsSendError,
    isUserOperationsSendIdle: isUserOperationsSendIdle,
  };
};
