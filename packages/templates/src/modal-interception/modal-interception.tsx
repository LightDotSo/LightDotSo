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
  } = useModals();

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

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

  const onDismiss = useCallback(() => {
    switch (type) {
      case "create":
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

  useEffect(() => {
    if (isOpen) {
      return;
    }

    switch (type) {
      case "create":
        if (pathname.includes("create")) {
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
