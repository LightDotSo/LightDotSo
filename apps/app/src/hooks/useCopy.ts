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

import copy from "copy-to-clipboard";
import { useRef, useState } from "react";

export const useCopy = (): [boolean, (text: string) => void] => {
  const [showCopied, setShowCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copyText = (text: string): void => {
    copy(text);
    setShowCopied(true);

    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setShowCopied(false);
      timeoutRef.current = null;
    }, 1500);
  };

  return [showCopied, copyText];
};
