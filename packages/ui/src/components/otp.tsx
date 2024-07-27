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

// From: https://github.com/ShlokDesai33/React18-OTP-Input/blob/1e8178380d1d2ee1306772e85ccfee25287d521b/src.tsx
// License: MIT

import { cn } from "@lightdotso/utils";
import type {
  ChangeEvent,
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Input } from "./input";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OtpFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  length: number;
}

interface NumericInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
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
      className="size-12 text-center"
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
}: OtpFieldProps) => {
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [inputs, setInputs] = useState(Array<string>(length).fill(""));

  const focusInput = (index: number) => {
    if (activeInputIndex === 0 && index === -1) {
      return;
    }
    setActiveInputIndex(Math.max(Math.min(length - 1, index), 0));
  };

  const triggerOnChange = (value: string, id: string) => {
    if (onChange) {
      let formattedValue = value;
      if (value.length === 6) {
        formattedValue = `${value.slice(0, 3)}-${value.slice(3, 6)}`;
      }
      const newEvent = {
        target: {
          value: formattedValue,
          id: id,
        },
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      onChange(newEvent as any);
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.currentTarget.value.toUpperCase();
    if (/^[0-9A-Z]$/.test(inputValue)) {
      e.preventDefault();

      const newInputs = [...inputs];
      newInputs[activeInputIndex] = inputValue;
      setInputs(newInputs);

      triggerOnChange(newInputs.join(""), `input-${activeInputIndex}`);
    }
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toUpperCase();

    // Handle command + v paste
    if (e.metaKey && key === "V") {
      return;
    }

    switch (key) {
      case "BACKSPACE": {
        setInputs((prevInputs) => {
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
      }

      case "ARROWLEFT": {
        e.preventDefault();
        focusInput(Math.max(0, activeInputIndex - 1));
        break;
      }

      case "ARROWRIGHT": {
        e.preventDefault();
        focusInput(Math.min(length - 1, activeInputIndex + 1));
        break;
      }

      default:
        if (key && /^[0-9A-Z]$/.test(key)) {
          e.preventDefault();
          setInputs((prevInputs) => {
            prevInputs[activeInputIndex] = key;
            return [...prevInputs];
          });
          if (activeInputIndex < length - 1) {
            focusInput(activeInputIndex + 1);
          }
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

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    let pastedData = e.clipboardData.getData("text/plain").trim().toUpperCase();

    if (
      /^[0-9A-Z]{3}-[0-9A-Z]{3}$/.test(pastedData) &&
      pastedData.length <= length + 1
    ) {
      pastedData = pastedData.replace("-", "");
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
        alphanumericChars.every((char) => /^[0-9A-Z]$/.test(char))
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
          key={`input-${
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            index
          }`}
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
