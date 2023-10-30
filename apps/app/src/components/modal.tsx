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

import { Dialog, DialogContent } from "@lightdotso/ui";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
  children: React.ReactNode;
}

export function Modal({ children }: ModalProps) {
  const router = useRouter();
  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Dialog open={true} defaultOpen={true} onOpenChange={onDismiss}>
      <DialogContent className="w-full overflow-scroll sm:max-h-[75%] sm:max-w-3xl">
        {children}
      </DialogContent>
    </Dialog>
  );
}
