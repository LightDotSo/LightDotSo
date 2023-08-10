/* eslint-disable jsx-a11y/label-has-associated-control */
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

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useState } from "react";
import { testAction } from "../_actions";

export function RawExample() {
  const [text, setText] = useState("");

  return (
    <div className="space-y-2">
      <label>
        Text to send: <br />
        <Input
          type="text"
          value={text}
          onChange={e => {
            setText(e.target.value);
          }}
        />
      </label>
      <Button
        onClick={async () => {
          const res = await testAction({
            text,
          });
          // eslint-disable-next-line no-console
          console.log("result", res);
          //          ^?
          if ("result" in res) {
            res.result;
            res.result.data;
            //           ^?
          } else {
            res.error;
            //   ^?
          }
          alert("Check console");
        }}
      >
        Run server action raw debugging
      </Button>
    </div>
  );
}
