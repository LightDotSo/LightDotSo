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
import { FooterButton, Modal } from "@lightdotso/templates";
import {
  DialogDescription,
  DialogTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DepositModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isDepositModalVisible, hideDepositModal } = useModals();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isDepositModalVisible) {
    return (
      <Modal
        bannerContent={
          <>
            <DialogTitle>Deposit</DialogTitle>
            <DialogDescription>
              Please choose assets to deposit to this wallet!
            </DialogDescription>
          </>
        }
        footerContent={<FooterButton className="pt-0" />}
        open
        onClose={hideDepositModal}
      >
        <Tabs defaultValue="token" className="py-3">
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="token">
              Token
            </TabsTrigger>
            <TabsTrigger className="w-full" value="nft">
              NFTs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="token">
            <p className="text-sm text-text-primary">
              Make changes to your account here. Click save when you&apos;re
              done.
            </p>
          </TabsContent>
          <TabsContent value="nft">
            <p className="text-sm text-text-primary">
              Change your password here. After saving, you&apos;ll be logged
              out.
            </p>
          </TabsContent>
        </Tabs>
      </Modal>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default DepositModal;
