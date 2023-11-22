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
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface ModalProps {
  children: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Modal: FC<ModalProps> = ({ children }) => {
  const router = useRouter();
  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Dialog open={true} defaultOpen={true} onOpenChange={onDismiss}>
      <DialogContent className="w-full overflow-scroll sm:max-h-[80%] sm:max-w-3xl">
        {children}
      </DialogContent>
    </Dialog>
  );
};
