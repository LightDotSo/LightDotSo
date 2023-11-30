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
import { Button } from "./button";
import { ToastAction } from "./toast";
import { useToast, type Toast as ToastProps } from "./use-toast";

const ToastDemo = (props: ToastProps) => {
  const { toast } = useToast();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          toast({
            ...props,
          });
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
    description: "Your message has been sent.",
  },
};

export const WithTitle: Story = {
  args: {
    title: "Uh oh! Something went wrong.",
    description: "There was a problem with your request.",
  },
};

export const WithAction: Story = {
  args: {
    title: "Uh oh! Something went wrong.",
    description: "There was a problem with your request.",
    action: <ToastAction altText="Try again">Try again</ToastAction>,
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "Uh oh! Something went wrong.",
    description: "There was a problem with your request.",
    action: <ToastAction altText="Try again">Try again</ToastAction>,
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    title: "Success!",
    description: "Your message has been sent.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "Info",
    description: "Your message has been sent.",
  },
};
