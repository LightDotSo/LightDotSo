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

import { rpcHandlers } from "./rpc";
import { simulationHandlers } from "./simulation";
import { socketHandlers } from "./socket";
// import { tokenHandlers } from "./token";
// import { tokenPriceHandlers } from "./token_price";
import { walletHandlers } from "./wallet";

export const handlers = [
  ...rpcHandlers,
  ...simulationHandlers,
  ...socketHandlers,
  // ...tokenPriceHandlers,
  // ...tokenHandlers,
  ...walletHandlers,
];
