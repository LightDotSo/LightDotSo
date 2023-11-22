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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@lightdotso/ui";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  DeleteIcon,
  CopyIcon,
  CopySlashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";
import { useCopy } from "@/hooks/useCopy";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const CommandK: FC = () => {
  const [open, setOpen] = useState(false);
  const [, copy] = useCopy();

  const router = useRouter();

  const onClearSearch = useCallback(() => {
    // Clear search params
    const url = new URL(window.location.href);
    url.search = "";
    router.replace(url.toString());
  }, [router]);

  const copyURIParams = useCallback(() => {
    // Copy search params
    const url = new URL(window.location.href);
    copy(url.search);
    console.info(url.search);
  }, [copy]);

  const copyDecodedURIParams = useCallback(() => {
    // Copy search params
    const url = new URL(window.location.href);
    copy(decodeURIComponent(url.search));
    console.info(decodeURIComponent(url.search));
  }, [copy]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "d" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClearSearch();
      }
      if (e.key === "k" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
      if (e.key === "c" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        copyURIParams();
      }
      if (e.key === "v" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        copyDecodedURIParams();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClearSearch, copyURIParams, copyDecodedURIParams]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 h-4 w-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘⇧P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <CommandShortcut>⌘⇧B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘⇧S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Dev">
          <CommandItem
            onSelect={() => {
              onClearSearch();
              setOpen(false);
            }}
          >
            <DeleteIcon className="mr-2 h-4 w-4" />
            <span>Clear Search Params</span>
            <CommandShortcut>⌘⇧D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              copyURIParams();
              setOpen(false);
            }}
          >
            <CopyIcon className="mr-2 h-4 w-4" />
            <span>Copy Search Params</span>
            <CommandShortcut>⌘⇧C</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              copyDecodedURIParams();
              setOpen(false);
            }}
          >
            <CopySlashIcon className="mr-2 h-4 w-4" />
            <span>Copy Decoded Search Params</span>
            <CommandShortcut>⌘⇧V</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default CommandK;
