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

"use server";

import { ResultCode } from "@/utils";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function getUser(_email: string) {
  // const user = await kv.hgetall<User>(`user:${email}`);
  // return user;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Result {
  type: string;
  resultCode: ResultCode;
}

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function authenticate(
  _prevState: Result | undefined,
  formData: FormData,
): Promise<Result | undefined> {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    const parsedCredentials = z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
      })
      .safeParse({
        email,
        password,
      });

    if (parsedCredentials.success) {
      // await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // });

      return {
        type: "success",
        resultCode: ResultCode.UserLoggedIn,
      };
    }
    return {
      type: "error",
      resultCode: ResultCode.InvalidCredentials,
    };
  } catch (_error) {
    // if (error instanceof AuthError) {
    //   switch (error.type) {
    //     case "CredentialsSignin":
    //       return {
    //         type: "error",
    //         resultCode: ResultCode.InvalidCredentials,
    //       };
    //     default:
    //       return {
    //         type: "error",
    //         resultCode: ResultCode.UnknownError,
    //       };
    //   }
    // }
  }
}
