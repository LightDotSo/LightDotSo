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
import { Modal } from "@lightdotso/templates";
import {
  Command,
  CommandList,
  CommandInput,
  TabsList,
  TabsTrigger,
  Tabs,
  TabsContent,
} from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CartModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { isCartModalVisible, hideCartModal } = useModals();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Command className="bg-transparent">
      <CommandList className="max-h-full">
        <Tabs className="w-full" defaultValue="all">
          <Modal
            isSheet
            open={isCartModalVisible}
            className="p-2"
            headerContent={
              <CommandInput
                className="my-0"
                wrapperClassName="flex grow border-b-0"
                placeholder="Type a chain or search..."
              />
            }
            bannerContent={
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="all">
                  All
                </TabsTrigger>
                <TabsTrigger className="w-full" value="queue">
                  Queue
                </TabsTrigger>
                <TabsTrigger className="w-full" value="history">
                  History
                </TabsTrigger>
              </TabsList>
            }
            onClose={hideCartModal}
          >
            <TabsContent value="all" />
            <TabsContent value="queue" />
            <TabsContent value="history" />
          </Modal>
        </Tabs>
      </CommandList>
    </Command>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default CartModal;
