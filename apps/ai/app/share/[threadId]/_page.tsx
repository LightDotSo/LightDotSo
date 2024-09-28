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

// import type { Metadata } from "next";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

// interface SharePageProps {
//   params: {
//     id: string;
//   };
// }

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

// export async function generateMetadata(
//   _params: SharePageProps,
// ): Promise<Metadata> {
//   // const chat = await getSharedChat(params.id);

//   return {
//     // title: chat?.title.slice(0, 50) ?? "Chat",
//     title: "Chat",
//   };
// }

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

// export default async function SharePage(_params: SharePageProps) {
// const chat = await getSharedChat(params.id);
// if (!chat?.sharePath) {
//   notFound();
// }
// const uiState: UIState = getUIStateFromAIState(chat);
// return (
//   <>
//     <div className="flex-1 space-y-6">
//       <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
//         <div className="mx-auto max-w-2xl">
//           <div className="md:-mx-8 space-y-1">
//             <h1 className="font-bold text-2xl">{chat.title}</h1>
//             <div className="text-text-weak text-sm">
//               {formatDate(chat.createdAt)} · {chat.messages.length} messages
//             </div>
//           </div>
//         </div>
//       </div>
//       <AI>
//         <ChatList messages={uiState} isShared={true} />
//       </AI>
//     </div>
//     <FooterText className="py-8" />
//   </>
// );
// }
