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

// Copyright 2023-2024 Vercel, Inc.
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

import type { Chat } from "@/ai/types";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SidebarItemsProps {
  chats?: Chat[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function SidebarItems({ chats }: SidebarItemsProps) {
  if (!chats?.length) {
    return null;
  }

  // return (
  //   <AnimatePresence>
  //     {chats.map(
  //       (chat, index) =>
  //         chat && (
  //           <motion.div
  //             key={chat?.id}
  //             exit={{
  //               opacity: 0,
  //               height: 0,
  //             }}
  //           >
  //             <SidebarItem index={index} chat={chat}>
  //               {/* <SidebarActions */}
  //                 // chat={chat}
  //                 // // removeChat={removeChat}
  //                 // shareChat={shareChat}
  //               />
  //             </SidebarItem>
  //           </motion.div>
  //         ),
  //     )}
  //   </AnimatePresence>
  // );
}
