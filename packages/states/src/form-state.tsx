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

import {
  useDelayedValue,
  useSignMessageState,
  useUserOperationsCreateState,
  useUserOperationsSendState,
} from "@lightdotso/hooks";
import { useFormRef } from "@lightdotso/stores";
import { useAccount } from "@lightdotso/wagmi";
import { useEffect, useMemo } from "react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FormState: FC = () => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { address, isConnecting } = useAccount();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the user operations create state
  const { isUserOperationsCreateLoading, isUserOperationsCreateSuccess } =
    useUserOperationsCreateState();

  // Get the user operations send state
  const { isUserOperationsSendLoading, isUserOperationsSendSuccess } =
    useUserOperationsSendState();

  // Get the user operations sign state
  const { isSignMessageLoading } = useSignMessageState();

  // Get the delayed success value
  const delayedIsUserOperationsCreateSuccess = useDelayedValue<boolean>(
    isUserOperationsCreateSuccess,
    false,
    3000,
  );

  // Get the delayed success value
  const delayedIsUserOperationsSendSuccess = useDelayedValue<boolean>(
    isUserOperationsSendSuccess,
    false,
    3000,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const formStateText = useMemo(() => {
    if (!address) {
      return "Connect Wallet";
    }

    if (isConnecting) {
      return "Connecting...";
    }

    if (isSignMessageLoading) {
      return "Signing...";
    }

    if (isUserOperationsCreateLoading) {
      return "Creating transactions...";
    }

    if (isUserOperationsSendLoading) {
      return "Sending transactions...";
    }

    if (delayedIsUserOperationsCreateSuccess) {
      return "Success";
    }

    if (delayedIsUserOperationsSendSuccess) {
      return "Sent";
    }

    return null;
  }, [
    address,
    isConnecting,
    isSignMessageLoading,
    isUserOperationsCreateLoading,
    isUserOperationsSendLoading,
    delayedIsUserOperationsCreateSuccess,
    delayedIsUserOperationsSendSuccess,
  ]);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setCustomFormSuccessText } = useFormRef();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the custom form success text
  useEffect(() => {
    if (!formStateText) {
      return;
    }
    setCustomFormSuccessText(formStateText);
  }, [formStateText, setCustomFormSuccessText]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // or return children if there are children to render
  return null;
};
