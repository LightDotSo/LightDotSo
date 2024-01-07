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
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input } from "./input";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OTPFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length: number;
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

  // Focus the input when the focus prop is true
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
      ref={inputRef}
      className="h-12 w-12 text-center"
      type="text"
      autoComplete="off"
      maxLength={1}
      {...props}
    />
  );
};

export const OTP = ({
  length,
  className,
  defaultValue,
  onChange,
}: OTPFieldProps) => {
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState(Array<string>(length).fill(""));

  const focusInput = (index: number) => {
    if (activeInputIndex === 0 && index === -1) return;
    setActiveInputIndex(Math.max(Math.min(length - 1, index), 0));
  };

  const triggerOnChange = (value: string, id: string) => {
    if (onChange) {
      let formattedValue = value;
      if (value.length === 6) {
        formattedValue = value.slice(0, 3) + "-" + value.slice(3, 6);
      }
      const newEvent = {
        target: {
          value: formattedValue,
          id,
        },
      };

      onChange(newEvent as any);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value.toUpperCase();
    if (/^[0-9A-Z]$/.test(inputValue)) {
      e.preventDefault();

      const newInputs = [...inputs];
      newInputs[activeInputIndex] = inputValue;
      setInputs(newInputs);

      triggerOnChange(newInputs.join(""), `input-${activeInputIndex}`);
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toUpperCase();

    switch (key) {
      case "BACKSPACE":
        setInputs(prevInputs => {
          prevInputs[activeInputIndex] = "";
          return [...prevInputs];
        });
        focusInput(activeInputIndex - 1);
        triggerOnChange(
          `${inputs.join("").slice(0, activeInputIndex - 1)}${inputs
            .join("")
            .slice(activeInputIndex)}`,
          `input-${activeInputIndex}`,
        );
        break;

      case "ARROWLEFT":
        e.preventDefault();
        focusInput(Math.max(0, activeInputIndex - 1));
        break;

      case "ARROWRIGHT":
        e.preventDefault();
        focusInput(Math.min(length - 1, activeInputIndex + 1));
        break;

      default:
        if (key && /^[0-9A-Z]$/.test(key)) {
          e.preventDefault();
          setInputs(prevInputs => {
            prevInputs[activeInputIndex] = key;
            return [...prevInputs];
          });
          if (activeInputIndex < length - 1) focusInput(activeInputIndex + 1);
          triggerOnChange(
            `${inputs.join("").slice(0, activeInputIndex)}${key}${inputs
              .join("")
              .slice(activeInputIndex + 1)}`,
            `input-${activeInputIndex}`,
          );
        }
        break;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    let pastedData = e.clipboardData.getData("text/plain").trim().toUpperCase();

    if (
      /^[0-9A-Z]{3}-[0-9A-Z]{3}$/.test(pastedData) &&
      pastedData.length <= length + 1
    ) {
      pastedData = pastedData.replace("-", ""); // Remove dash
      const pastedChars = pastedData.split("");

      const updatedInputs = [...inputs];
      updatedInputs.fill(
        "",
        activeInputIndex,
        activeInputIndex + pastedChars.length,
      );
      for (let i = 0; i < pastedChars.length; i++) {
        updatedInputs[activeInputIndex + i] = pastedChars[i];
      }

      setInputs(updatedInputs);
      const nextFocusIndex = activeInputIndex + pastedChars.length - 1;

      if (nextFocusIndex === length) {
        setActiveInputIndex(-1);
      } else {
        focusInput(nextFocusIndex + 1);
      }

      triggerOnChange(
        updatedInputs.join("").replace(/^(.{3})/, "$1-"),
        `input-${activeInputIndex}`,
      );
    }
  };

  useEffect(() => {
    const defaultVal = defaultValue as string;

    if (defaultVal) {
      const alphanumericChars = defaultVal.replace("-", "").split("");

      if (
        alphanumericChars.length === length &&
        alphanumericChars.every(char => /^[0-9A-Z]$/.test(char))
      ) {
        setInputs([...alphanumericChars]);
        setActiveInputIndex(-1);
      } else {
        setInputs(Array<string>(length).fill(""));
        setActiveInputIndex(0);
      }
    } else {
      setInputs(Array<string>(length).fill(""));
      setActiveInputIndex(0);
    }
  }, [defaultValue, length]);

  return (
    <div className={cn("flex space-x-3", className)}>
      {inputs.map((value, index) => (
        <NumericInputField
          key={`input-${index}`}
          id={`input-${index}`}
          focus={activeInputIndex === index}
          value={value}
          onFocus={() => focusInput(index)}
          onChange={handleOnChange}
          onBlur={() => setActiveInputIndex(-1)}
          onKeyDown={handleOnKeyDown}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};
