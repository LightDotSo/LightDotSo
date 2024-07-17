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

import { useTokenGroups } from "@lightdotso/stores";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

type TokenAmountsProps = {
  group_id: string | undefined;
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useTokenAmounts = ({ group_id }: TokenAmountsProps) => {
  const { tokenGroups } = useTokenGroups();

  const tokenAmounts = useMemo(() => {
    if (!group_id) {
      return;
    }

    // Check if tokenGroups has group_id as key
    if (!tokenGroups[group_id]) {
      return;
    }

    const tokenAmounts = tokenGroups[group_id];

    return tokenAmounts;
  }, [group_id, tokenGroups]);
  console.log(JSON.stringify(tokenGroups));
  console.log(group_id);
  console.log(tokenAmounts);

  return {
    tokenAmounts: tokenAmounts,
  };
};
