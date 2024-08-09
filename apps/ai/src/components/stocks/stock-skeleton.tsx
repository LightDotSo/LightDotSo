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

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const StockSkeleton = () => {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-green-400">
      <div className="float-right inline-block w-fit rounded-full bg-zinc-700 px-2 py-1 text-transparent text-xs">
        xxxxxxx
      </div>
      <div className="mb-1 w-fit rounded-md bg-zinc-700 text-lg text-transparent">
        xxxx
      </div>
      <div className="w-fit rounded-md bg-zinc-700 font-bold text-3xl text-transparent">
        xxxx
      </div>
      <div className="text mt-1 w-fit rounded-md bg-zinc-700 text-transparent text-xs">
        xxxxxx xxx xx xxxx xx xxx
      </div>

      <div className="-mx-4 relative cursor-col-resize">
        <div style={{ height: 146 }} />
      </div>
    </div>
  );
};
