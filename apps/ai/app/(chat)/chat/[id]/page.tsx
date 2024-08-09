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

import { getMissingKeys } from "@/app/actions";
import { AI } from "@/chat/actions";
import { Chat } from "@/components/chat";
import type { Metadata } from "next";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface ChatPageProps {
  params: {
    id: string;
  };
}

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export async function generateMetadata(
  _params: ChatPageProps,
): Promise<Metadata> {
  // const session = await auth();

  // if (!session?.user) {
  //   return {};
  // }

  // const chat = await getChat(params.id, session.user.id);
  // return {
  //   title: chat?.title.toString().slice(0, 50) ?? "Chat",
  // };
  return {
    title: "Chat",
  };
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function ChatPage(_params: ChatPageProps) {
  // const session = (await auth()) as Session;
  const missingKeys = await getMissingKeys();

  // if (!session?.user) {
  //   redirect(`/login?next=/chat/${params.id}`);
  // }

  // const userId = session.user.id as string;
  // const chat = await getChat(params.id, userId);

  // if (!chat) {
  //   redirect("/");
  // }

  // if (chat?.userId !== session?.user?.id) {
  //   notFound();
  // }

  return (
    <AI initialAIState={{ chatId: "id", messages: [] }}>
      <Chat id={"id"} missingKeys={missingKeys} />
    </AI>
  );
}
