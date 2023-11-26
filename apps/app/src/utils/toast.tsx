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

import { ToastAction, toast } from "@lightdotso/ui";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const errorToast = (err: string) =>
  toast({
    variant: "destructive",
    title: "Uh oh! Something went wrong.",
    description: err,
    action: <ToastAction altText="Try again">Try again</ToastAction>,
  });

export const successToast = (data: any) =>
  toast({
    variant: "success",
    description: JSON.stringify(data, null, 2),
  });

export const infoToast = (title: string) =>
  toast({
    variant: "info",
    title,
  });
