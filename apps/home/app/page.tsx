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

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page() {
  return (
    <div>
      <div className="absolute inset-x-0 -top-[48rem] z-0 block overflow-hidden">
        <img
          className="size-full animate-spin-slow object-cover select-none pointer-events-none"
          src="/spiral.svg"
          alt="Spiral"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center h-screen justify-center">
        <div className="text-center p-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
            EVM chain abstraction protocol unifying all chains as one.
          </h1>
        </div>
      </div>
    </div>
  );
}
