/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
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

"use client";

import { getWallets } from "@lightdotso/client";
import { useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function Page() {
  const [wallets, setWallets] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      getWallets({ params: { query: {} } }, "public").then(wallets => {
        setWallets(JSON.stringify(wallets, null, 2));
      });
    }, 3000); // Running every 3 seconds

    return () => clearInterval(interval); // clearing interval on component unmount
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <pre>{wallets}</pre>
    </>
  );
}
