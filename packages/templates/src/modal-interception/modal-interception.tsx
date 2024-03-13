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

"use client";

import { useModals } from "@lightdotso/stores";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type { FC, ReactNode } from "react";
import { Modal } from "../modal";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalInterceptionProps {
  children: ReactNode;
  type: "create" | "op" | "notifications" | "send" | "deposit";
  isHeightFixed?: boolean;
  bannerContent?: ReactNode;
  footerContent?: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ModalInterception: FC<ModalInterceptionProps> = ({
  children,
  isHeightFixed = false,
  bannerContent,
  footerContent,
  type,
}) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    isCreateModalBackground,
    isDepositModalBackground,
    isNotificationsModalBackground,
    isOpModalBackground,
    isSendModalBackground,
    isCreateModalVisible,
    isDepositModalVisible,
    isNotificationsModalVisible,
    isOpModalVisible,
    isSendModalVisible,
    setSendBackgroundModal,
    showCreateModal,
    showDepositModal,
    showNotificationsModal,
    showOpModal,
    showSendModal,
    hideCreateModal,
    hideDepositModal,
    hideNotificationsModal,
    hideOpModal,
    hideSendModal,
    hideAllModalsBackground,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Determine if the modal is a background modal
  const isBackground = useMemo(() => {
    switch (type) {
      case "create":
        return isCreateModalBackground;
      case "deposit":
        return isDepositModalBackground;
      case "op":
        return isOpModalBackground;
      case "notifications":
        return isNotificationsModalBackground;
      case "send":
        return isSendModalBackground;
    }
  }, [
    isCreateModalBackground,
    isDepositModalBackground,
    isNotificationsModalBackground,
    isOpModalBackground,
    isSendModalBackground,
    type,
  ]);

  // Determine if the modal is open
  const isOpen = useMemo(() => {
    switch (type) {
      case "create":
        return isCreateModalVisible;
      case "deposit":
        return isDepositModalVisible;
      case "op":
        return isOpModalVisible;
      case "notifications":
        return isNotificationsModalVisible;
      case "send":
        return isSendModalVisible;
    }
  }, [
    isCreateModalVisible,
    isDepositModalVisible,
    isNotificationsModalVisible,
    isOpModalVisible,
    isSendModalVisible,
    type,
  ]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // Dismiss the modal and go back to the previous page
  const onDismiss = useCallback(() => {
    switch (type) {
      // Only the create modal can be nested opened from the send modal
      // Hence, we need to set the send modal to visible when the create modal is dismissed
      case "create":
        setSendBackgroundModal(false);
        hideCreateModal();
        router.back();
        break;
      case "deposit":
        hideDepositModal();
        router.back();
        break;
      case "op":
        hideOpModal();
        router.back();
        break;
      case "notifications":
        hideNotificationsModal();
        router.back();
        break;
      case "send":
        hideSendModal();
        router.back();
        break;
    }
  }, [
    hideCreateModal,
    hideDepositModal,
    hideNotificationsModal,
    hideOpModal,
    hideSendModal,
    router,
    type,
  ]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Show the modal when the path matches the modal type
  useEffect(() => {
    if (isOpen) {
      return;
    }

    switch (type) {
      case "create":
        // Open the create modal and set the send modal to background
        if (pathname.includes("create")) {
          setSendBackgroundModal(true);
          showCreateModal();
        }
        break;
      case "deposit":
        if (pathname.includes("deposit")) {
          showDepositModal();
        }
        break;
      case "op":
        if (pathname.includes("op")) {
          showOpModal();
        }
        break;
      case "notifications":
        if (pathname.includes("notifications")) {
          showNotificationsModal();
        }
        break;
      case "send":
        if (pathname.includes("send")) {
          showSendModal();
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, type]);

  // Hide all modals background when the modal is opened
  // This is to prevent the modal sent to background and not being visible when the modal is opened
  // Except for the create modal, which can be nested opened from the send modal
  useEffect(() => {
    if (type !== "create") {
      return;
    }

    hideAllModalsBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // If the modal is not open, return null
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isHeightFixed={isHeightFixed}
      isHidden={isBackground}
      bannerContent={bannerContent}
      footerContent={footerContent}
      size={type === "op" ? "lg" : "default"}
      open={isOpen}
      onClose={onDismiss}
    >
      {children}
    </Modal>
  );
};
