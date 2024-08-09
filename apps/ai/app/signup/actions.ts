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

// import { signIn } from "@/auth";
import { ResultCode } from "@/utils";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function createUser(
  _email: string,
  _hashedPassword: string,
  _salt: string,
) {
  // const existingUser = await getUser(email);

  // if (existingUser) {
  //   return {
  //     type: "error",
  //     resultCode: ResultCode.UserAlreadyExists,
  //   };
  // }
  // const user = {
  //   id: crypto.randomUUID(),
  //   email,
  //   password: hashedPassword,
  //   salt,
  // };

  // await kv.hmset(`user:${email}`, user);

  return {
    type: "success",
    resultCode: ResultCode.UserCreated,
  };
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
export async function signup(
  _prevState: Result | undefined,
  _formData: FormData,
): Promise<Result | undefined> {
  // const email = formData.get("email") as string;
  // const password = formData.get("password") as string;

  // const parsedCredentials = z
  //   .object({
  //     email: z.string().email(),
  //     password: z.string().min(6),
  //   })
  //   .safeParse({
  //     email,
  //     password,
  //   });

  // if (parsedCredentials.success) {
  //   const salt = crypto.randomUUID();

  //   const encoder = new TextEncoder();
  //   const saltedPassword = encoder.encode(password + salt);
  //   const hashedPasswordBuffer = await crypto.subtle.digest(
  //     "SHA-256",
  //     saltedPassword,
  //   );
  //   const hashedPassword = getStringFromBuffer(hashedPasswordBuffer);

  //   try {
  //     const result = await createUser(email, hashedPassword, salt);

  //     if (result.resultCode === ResultCode.UserCreated) {
  //       await signIn("credentials", {
  //         email,
  //         password,
  //         redirect: false,
  //       });
  //     }

  //     return result;
  //   } catch (error) {
  //     if (error instanceof AuthError) {
  //       switch (error.type) {
  //         case "CredentialsSignin":
  //           return {
  //             type: "error",
  //             resultCode: ResultCode.InvalidCredentials,
  //           };
  //         default:
  //           return {
  //             type: "error",
  //             resultCode: ResultCode.UnknownError,
  //           };
  //       }
  //     }
  //     return {
  //       type: "error",
  //       resultCode: ResultCode.UnknownError,
  //     };
  //   }
  // } else {
  //   return {
  //     type: "error",
  //     resultCode: ResultCode.InvalidCredentials,
  //   };
  // }

  return undefined;
}
