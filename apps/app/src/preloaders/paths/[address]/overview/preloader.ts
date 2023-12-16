// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// import { preloader as preloadOverviewHistory } from "@/preloaders/paths/[address]/overview/history/preloader";
// import { preloader as preloadOverviewNfts } from "@/preloaders/paths/[address]/overview/nfts/preloader";
// import { preloader as preloadOverviewTokens } from "@/preloaders/paths/[address]/overview/tokens/preloader";
import { preloader as addressPreloader } from "@/preloaders/paths/[address]/preloader";

// -----------------------------------------------------------------------------
// Preloader
// -----------------------------------------------------------------------------

export const preloader = async (params: { address: string }) => {
  addressPreloader(params);
  // preloadOverviewHistory(params);
  // preloadOverviewNfts(params);
  // preloadOverviewTokens(params);
};
