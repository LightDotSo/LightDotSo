#!/bin/bash

# Copyright 2023-2024 LightDotSo.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

pnpm ardrive list-folder --parent-folder-id e64326f2-d457-4dd8-85cb-27e1b9f3969b > meta/root.json
pnpm ardrive list-folder --parent-folder-id c10c6082-5512-4596-864c-93e4c66d896d > meta/paper.json
pnpm ardrive list-folder --parent-folder-id dd2b4fc4-4075-4970-89a5-57d06b683ba6 > meta/proposals.json
