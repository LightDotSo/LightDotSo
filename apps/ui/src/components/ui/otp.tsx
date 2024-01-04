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

// From: https://github.com/ShlokDesai33/React18-OTP-Input/blob/1e8178380d1d2ee1306772e85ccfee25287d521b/src.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import { useLayoutEffect, useRef, useState } from "react";
import { Input } from "./input";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OTPFieldProps {
  length: number;
  className?: string;
}

interface NumericInputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  focus: boolean;
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const NumericInputField = ({ focus, ...props }: NumericInputFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      if (focus) {
        inputRef.current.focus();
        inputRef.current.select();
      } else {
        inputRef.current.blur();
      }
    }
  }, [focus]);

  return (
    <Input
      className="w-12 h-12 text-center"
      type="text"
      autoComplete="off"
      maxLength={1}
      ref={inputRef}
      {...props}
    />
  );
};

export const OTP = ({ length, className }: OTPFieldProps) => {
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState(Array<string>(length).fill(""));

  const focusInput = (index: number) => {
    if (activeInputIndex === 0 && index === -1) return;
    setActiveInputIndex(Math.max(Math.min(length - 1, index), 0));
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^[0-9]$/.test(e.currentTarget.value)) {
      e.preventDefault();
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;

    switch (key) {
      case "Backspace":
      case "Delete": {
        e.preventDefault();
        if (inputs[activeInputIndex].length !== 0) {
          const newInputs = [...inputs];
          newInputs[activeInputIndex] = "";
          setInputs(newInputs);
        } else {
          const newInputs = [...inputs];
          newInputs[activeInputIndex - 1] = "";
          setInputs(newInputs);
          focusInput(activeInputIndex - 1);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        focusInput(activeInputIndex - 1);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        focusInput(activeInputIndex + 1);
        break;
      }
      default: {
        if (/^[0-9]$/.test(key)) {
          e.preventDefault();
          const newInputs = [...inputs];
          newInputs[activeInputIndex] = key;
          setInputs(newInputs);
          if (activeInputIndex === length - 1) {
            setActiveInputIndex(-1);
          } else {
            focusInput(activeInputIndex + 1);
          }
          break;
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text/plain")
      .trim()
      .slice(0, length - activeInputIndex)
      .split("");

    if (pastedData) {
      let nextFocusIndex = 0;
      const updatedInputs = [...inputs];

      updatedInputs.forEach((val, index) => {
        if (index >= activeInputIndex) {
          let changedValue = pastedData.shift() || val;
          changedValue = Number(changedValue) >= 0 ? changedValue : "";
          if (changedValue) {
            updatedInputs[index] = changedValue;
            nextFocusIndex = index;
          }
        }
      });

      setInputs(updatedInputs);
      if (nextFocusIndex === length - 1) {
        setActiveInputIndex(-1);
      } else {
        focusInput(nextFocusIndex + 1);
      }
    }
  };

  return (
    <div className={cn("flex space-x-3", className)}>
      {inputs.map((value, index) => (
        <NumericInputField
          key={`input-${index}`}
          id={`input-${index}`}
          focus={activeInputIndex === index}
          onFocus={() => focusInput(index)}
          value={value}
          onChange={handleOnChange}
          onBlur={() => setActiveInputIndex(-1)}
          onKeyDown={handleOnKeyDown}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};
