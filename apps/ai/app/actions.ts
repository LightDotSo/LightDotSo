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

"use server";

// import { auth } from "@/auth";
import type { Chat } from "@/types";
// import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function getChats(userId?: string | null) {
  if (!userId) {
    return [];
  }

  // try {
  //   const pipeline = kv.pipeline();
  //   const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
  //     rev: true,
  //   });

  //   for (const chat of chats) {
  //     pipeline.hgetall(chat);
  //   }

  //   const results = await pipeline.exec();

  //   return results as Chat[];
  // } catch (_error) {
  //   return [];
  // }
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function getChat(_id: string, _userId: string) {
  // const chat = await kv.hgetall<Chat>(`chat:${id}`);
  // if (!chat || (userId && chat.userId !== userId)) {
  //   return null;
  // }
  // return chat;
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
export async function removeChat({ id, path }: { id: string; path: string }) {
  // const session = await auth();

  // if (!session) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  // //Convert uid to string for consistent comparison with session.user.id
  // const uid = String(await kv.hget(`chat:${id}`, "userId"));

  // if (uid !== session?.user?.id) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  // await kv.del(`chat:${id}`);
  // await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`);

  revalidatePath("/");
  return revalidatePath(path);
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function clearChats() {
  // const session = await auth();

  // if (!session?.user?.id) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  // const chats: string[] = await kv.zrange(
  //   `user:chat:${session.user.id}`,
  //   0,
  //   -1,
  // );
  // if (!chats.length) {
  //   return redirect("/");
  // }
  // const pipeline = kv.pipeline();

  // for (const chat of chats) {
  //   pipeline.del(chat);
  //   pipeline.zrem(`user:chat:${session.user.id}`, chat);
  // }

  // await pipeline.exec();

  revalidatePath("/");
  return redirect("/");
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function getSharedChat(_id: string) {
  return null;
  // const chat = await kv.hgetall<Chat>(`chat:${id}`);
  // if (!chat?.sharePath) {
  //   return null;
  // }
  // return chat;
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function shareChat(_id: string) {
  // const session = await auth();
  // if (!session?.user?.id) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }
  // const chat = await kv.hgetall<Chat>(`chat:${id}`);
  // if (!chat || chat.userId !== session.user.id) {
  //   return {
  //     error: "Something went wrong",
  //   };
  // }
  // const payload = {
  //   ...chat,
  //   sharePath: `/share/${chat.id}`,
  // };
  // await kv.hmset(`chat:${chat.id}`, payload);
  // return payload;
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function saveChat(_chat: Chat) {
  // const session = await auth();
  // if (session?.user) {
  //   const pipeline = kv.pipeline();
  //   pipeline.hmset(`chat:${chat.id}`, chat);
  //   pipeline.zadd(`user:chat:${chat.userId}`, {
  //     score: Date.now(),
  //     member: `chat:${chat.id}`,
  //   });
  //   await pipeline.exec();
  // } else {
  //   return;
  // }
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function refreshHistory(path: string) {
  redirect(path);
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function getMissingKeys() {
  const keysRequired = ["OPENAI_API_KEY"];
  return keysRequired
    .map((key) => (process.env[key] ? "" : key))
    .filter((key) => key !== "");
}
