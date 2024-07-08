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

import type { StoryObj, Meta } from "@storybook/react";
import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";
import { toast } from "sonner";
import { Button } from "./button";
import { toastMinimalIntentStyles, toastMinimalLoadingStyles } from "./toast";

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const ToastDemo = ({
  message,
  data,
  variant = "default",
}: {
  message: ReactNode;
  variant?: "default" | "success" | "error" | "loading" | "info" | "warning";
  data?: ExternalToast;
}) => {
  return (
    <Button
      variant="outline"
      onClick={() => {
        switch (variant) {
          case "default":
            toast(message, data);
            break;
          case "success":
            toast.success(message, data);
            break;
          case "error":
            toast.error(message, data);
            break;
          case "loading":
            toast.loading(message, data);
            break;
          case "warning":
            toast.warning(message, data);
            break;
          case "info":
            toast.info(message, data);
            break;
          default:
            break;
        }
      }}
    >
      Show Toast
    </Button>
  );
};

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ToastDemo> = {
  title: "component/Toast",
  component: ToastDemo,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof ToastDemo>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Simple: Story = {
  args: {
    message: "Hello World",
  },
};
export const Description: Story = {
  args: {
    message: "Hello World",
    data: {
      description: "This is a description.",
    },
  },
};
export const Error: Story = {
  args: {
    message: "There was a problem with your request.",
    variant: "error",
  },
};
export const Success: Story = {
  args: {
    message: "Your request was successful.",
    variant: "success",
    data: {
      description: "This is a description.",
    },
  },
};
export const Info: Story = {
  args: {
    message: "This is an informational message.",
    variant: "info",
  },
};
export const Warning: Story = {
  args: {
    message: "This is a warning message.",
    variant: "warning",
  },
};
export const Loading: Story = {
  args: {
    message: "Loading...",
    variant: "loading",
  },
};
export const Action: Story = {
  args: {
    message: "This is an action toast.",
    variant: "info",
    data: {
      action: {
        label: "Action",
        onClick: () => {
          console.info("Action clicked");
        },
      },
      duration: 400000,
    },
  },
};
export const Cancel: Story = {
  args: {
    message: "This is a cancel toast.",
    variant: "info",
    data: {
      cancel: {
        label: "Cancel",
      },
    },
  },
};
export const Close: Story = {
  args: {
    message: "This is an close toast.",
    variant: "warning",
    data: {
      closeButton: true,
    },
  },
};
export const MinimalLoading: Story = {
  args: {
    variant: "loading",
    data: {
      ...toastMinimalLoadingStyles,
    },
  },
};
export const MinimalIntent: Story = {
  args: {
    variant: "success",
    data: {
      ...toastMinimalIntentStyles,
    },
  },
};
