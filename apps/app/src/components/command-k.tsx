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

"use client";

import { useCopy } from "@lightdotso/hooks";
import { useAuth, useDev, useSettings } from "@lightdotso/stores";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@lightdotso/ui/components/command";
import { toast } from "@lightdotso/ui/components/toast";
import {
  Calculator,
  Calendar,
  Computer,
  CopyIcon,
  CopySlashIcon,
  CreditCard,
  DeleteIcon,
  Settings,
  Smile,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const CommandK: FC = () => {
  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const [, copy] = useCopy();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [open, setOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { wallet } = useAuth();
  const { toggleDev } = useDev();
  const { toggleQueryDevTools } = useSettings();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onClearSearch = useCallback(() => {
    // Clear search params
    const url = new URL(window.location.href);
    url.search = "";
    router.replace(url.toString());
  }, [router]);

  const copyUriParams = useCallback(() => {
    // Copy search params
    const url = new URL(window.location.href);
    copy(url.search);
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info(url.search);
  }, [copy]);

  const copyDecodedUriParams = useCallback(() => {
    // Copy search params
    const url = new URL(window.location.href);
    copy(decodeURIComponent(url.search));
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.info(decodeURIComponent(url.search));
  }, [copy]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "a" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (wallet) {
          copy(wallet);
          toast.success("Copied to clipboard!");
        }
      }
      if (e.key === "v" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleDev();
      }
      if (e.key === "d" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClearSearch();
      }
      if (e.key === "c" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        copyUriParams();
      }
      if (e.key === "v" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        copyDecodedUriParams();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [
    onClearSearch,
    copyUriParams,
    copyDecodedUriParams,
    wallet,
    copy,
    toggleDev,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 size-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 size-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 size-4" />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 size-4" />
            <span>Profile</span>
            <CommandShortcut>⌘⇧P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 size-4" />
            <span>Billing</span>
            <CommandShortcut>⌘⇧B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 size-4" />
            <span>Settings</span>
            <CommandShortcut>⌘⇧S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Dev">
          <CommandItem
            onSelect={() => {
              toggleDev();
              setOpen(false);
            }}
          >
            <Computer className="mr-2 size-4" />
            <span>Toggle Dev</span>
            <CommandShortcut>⌘⇧V</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              toggleQueryDevTools();
              setOpen(false);
            }}
          >
            <DeleteIcon className="mr-2 size-4" />
            <span>Toggle Query</span>
            <CommandShortcut>⌘⇧A</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onClearSearch();
              setOpen(false);
            }}
          >
            <DeleteIcon className="mr-2 size-4" />
            <span>Clear Search Params</span>
            <CommandShortcut>⌘⇧D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              copyUriParams();
              setOpen(false);
            }}
          >
            <CopyIcon className="mr-2 size-4" />
            <span>Copy Search Params</span>
            <CommandShortcut>⌘⇧C</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              copyDecodedUriParams();
              setOpen(false);
            }}
          >
            <CopySlashIcon className="mr-2 size-4" />
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

// biome-ignore lint/style/noDefaultExport: <explanation>
export default CommandK;
