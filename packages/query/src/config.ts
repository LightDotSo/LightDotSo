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

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export const LIVE_CONFIG = {
  refetchIntervalInBackground: true,
  refetchInterval: 1000 * 8,
  retryOnMount: false,
};

export const USER_OPERATION_CONFIG = {
  refetchIntervalInBackground: true,
  refetchInterval: 1000 * 30,
  retryOnMount: false,
};

export const USER_OPERATION_RECEIPT_CONFIG = {
  retry: false,
};
