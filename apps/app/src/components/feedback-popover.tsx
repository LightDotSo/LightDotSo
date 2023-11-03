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

import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
} from "@lightdotso/ui";
import { useAuth } from "@/stores/useAuth";
import { useIsMounted } from "@/hooks/useIsMounted";
import { FeedbackForm } from "@/components/feedback-form";
import { useState } from "react";

export function FeedbackPopover() {
  const isMounted = useIsMounted();
  const { address } = useAuth();
  const [open, setOpen] = useState(false);

  // If the address is empty, return null
  if (!isMounted || !address) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="hidden md:block">
          Feedback
          <span className="sr-only">Open popover</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <FeedbackForm onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
