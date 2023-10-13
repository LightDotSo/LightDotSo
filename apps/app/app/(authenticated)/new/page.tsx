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

import { DashboardIcon } from "@radix-ui/react-icons";
import { Button } from "@lightdotso/ui";

export default async function Page() {
  return (
    <div className="mt-8 h-96 w-full rounded-md border border-border bg-card">
      <div className="mx-auto flex max-w-xl flex-col">
        <div className="mt-20 flex justify-center">
          <div className="flex flex-col">
            <Button
              size="unsized"
              className="rounded-full border fill-muted-foreground p-4"
              variant="secondary"
            >
              <DashboardIcon className="h-8 w-8"></DashboardIcon>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
