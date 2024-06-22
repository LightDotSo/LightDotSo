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

import { Spiral } from "@/components/spiral";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page() {
  return (
    <div>
      <Spiral />
      <div className="relative z-10 flex flex-col items-center h-screen justify-center">
        <div className="p-4">
          <h1 className="max-w-2xl text-4xl lg:text-6xl font-extrabold">
            EVM chain abstraction
            <br />
            protocol unifying all
            <br />
            chains as one.
          </h1>
        </div>
      </div>
    </div>
  );
}
