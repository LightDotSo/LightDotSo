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

import { TransactionDialog } from "@/components/transaction-dialog";
import { Button, DialogTrigger } from "@lightdotso/ui";

export default async function Page() {
  return (
    <TransactionDialog>
      <DialogTrigger asChild>
        <Button>Deploy on Sepolia</Button>
      </DialogTrigger>
    </TransactionDialog>
  );
}
