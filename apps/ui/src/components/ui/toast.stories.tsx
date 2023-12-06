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

import type { StoryObj, Meta } from "@storybook/react";
import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";
import { toast } from "sonner";
import { Button } from "./button";

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
    <>
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
    </>
  );
};

const meta: Meta<typeof ToastDemo> = {
  title: "ui/Toast",
  component: ToastDemo,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ToastDemo>;

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
    message: "This is an informational message.",
    variant: "info",
    data: {
      action: {
        label: "Action",
        onClick: () => {
          console.info("Action clicked");
        },
      },
    },
  },
};
export const Close: Story = {
  args: {
    message: "This is an informational message.",
    variant: "info",
    data: {
      cancel: {
        label: "Cancel",
      },
    },
  },
};
