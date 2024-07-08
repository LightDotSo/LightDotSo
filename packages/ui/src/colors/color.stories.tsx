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

import { ColorItem, ColorPalette } from "@storybook/blocks";
import type { Meta } from "@storybook/react";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta = {
  title: "theme/Color",
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base = {
  render: args => (
    <ColorPalette>
      <ColorItem
        title="background"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background))",
          body: "hsl(var(--background-body))",
          overlay: "hsl(var(--background-overlay))",
          strong: "hsl(var(--background-strong))",
          stronger: "hsl(var(--background-stronger))",
          strongest: "hsl(var(--background-strongest))",
          weak: "hsl(var(--background-weak))",
        }}
      />
      <ColorItem
        title="background-destructive"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-destructive))",
          strong: "hsl(var(--background-destructive-strong))",
          stronger: "hsl(var(--background-destructive-stronger))",
          strongest: "hsl(var(--background-destructive-strongest))",
          weak: "hsl(var(--background-destructive-weak))",
          weaker: "hsl(var(--background-destructive-weaker))",
          weakest: "hsl(var(--background-destructive-weakest))",
        }}
      />
      <ColorItem
        title="background-error"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-error))",
          strong: "hsl(var(--background-error-strong))",
          stronger: "hsl(var(--background-error-stronger))",
          strongest: "hsl(var(--background-error-strongest))",
          weakest: "hsl(var(--background-error-weakest))",
        }}
      />
      <ColorItem
        title="background-indigo"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-indigo))",
          weakest: "hsl(var(--background-indigo-weakest))",
        }}
      />
      <ColorItem
        title="background-info"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-info))",
          weakest: "hsl(var(--background-info-weakest))",
        }}
      />
      <ColorItem
        title="background-body-inverse"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-body-inverse))",
        }}
      />
      <ColorItem
        title="background-inverse"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-inverse))",
          strong: "hsl(var(--background-inverse-strong))",
          stronger: "hsl(var(--background-inverse-stronger))",
        }}
      />
      <ColorItem
        title="background-neutral"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-neutral))",
          weakest: "hsl(var(--background-neutral-weakest))",
        }}
      />
      <ColorItem
        title="background-pink"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-pink))",
          weakest: "hsl(var(--background-pink-weakest))",
        }}
      />
      <ColorItem
        title="background-primary"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-primary))",
          strong: "hsl(var(--background-primary-strong))",
          stronger: "hsl(var(--background-primary-stronger))",
          strongest: "hsl(var(--background-primary-strongest))",
          weak: "hsl(var(--background-primary-weak))",
          weaker: "hsl(var(--background-primary-weaker))",
          weakest: "hsl(var(--background-primary-weakest))",
        }}
      />
      <ColorItem
        title="background-purple"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-purple))",
          weakest: "hsl(var(--background-purple-weakest))",
        }}
      />
      <ColorItem
        title="background-success"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-success))",
          weakest: "hsl(var(--background-success-weakest))",
        }}
      />
      <ColorItem
        title="background-warning"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--background-warning))",
          weakest: "hsl(var(--background-warning-weakest))",
        }}
      />
      <ColorItem
        title="border"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
          weak: "hsl(var(--border-weak))",
          weaker: "hsl(var(--border-weaker))",
          weakest: "hsl(var(--border-weakest))",
        }}
      />
      <ColorItem
        title="border-destructive"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-destructive))",
          strong: "hsl(var(--border-destructive-strong))",
          stronger: "hsl(var(--border-destructive-stronger))",
          strongest: "hsl(var(--border-destructive-strongest))",
          weak: "hsl(var(--border-destructive-weak))",
          weaker: "hsl(var(--border-destructive-weaker))",
          weakest: "hsl(var(--border-destructive-weakest))",
        }}
      />
      <ColorItem
        title="border-error"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-error))",
          strong: "hsl(var(--border-error-strong))",
          stronger: "hsl(var(--border-error-stronger))",
          strongest: "hsl(var(--border-error-strongest))",
          weak: "hsl(var(--border-error-weak))",
          weaker: "hsl(var(--border-error-weaker))",
          weakest: "hsl(var(--border-error-weakest))",
        }}
      />
      <ColorItem
        title="border-indigo"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-indigo))",
          weak: "hsl(var(--border-indigo-weak))",
          weaker: "hsl(var(--border-indigo-weaker))",
          weakest: "hsl(var(--border-indigo-weakest))",
        }}
      />
      <ColorItem
        title="border-info"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-info))",
          weak: "hsl(var(--border-info-weak))",
          weaker: "hsl(var(--border-info-weaker))",
          weakest: "hsl(var(--border-info-weakest))",
        }}
      />
      <ColorItem
        title="border-inverse"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-inverse))",
          strong: "hsl(var(--border-inverse-strong))",
          stronger: "hsl(var(--border-inverse-stronger))",
          strongest: "hsl(var(--border-inverse-strongest))",
          weaker: "hsl(var(--border-inverse-weaker))",
          weakest: "hsl(var(--border-inverse-weakest))",
        }}
      />
      <ColorItem
        title="border-neutral"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-neutral))",
          weak: "hsl(var(--border-neutral-weak))",
          weaker: "hsl(var(--border-neutral-weaker))",
          weakest: "hsl(var(--border-neutral-weakest))",
        }}
      />
      <ColorItem
        title="border-pink"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-pink))",
          weak: "hsl(var(--border-pink-weak))",
          weaker: "hsl(var(--border-pink-weaker))",
          weakest: "hsl(var(--border-pink-weakest))",
        }}
      />
      <ColorItem
        title="border-primary"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-primary))",
          strong: "hsl(var(--border-primary-strong))",
          stronger: "hsl(var(--border-primary-stronger))",
          strongest: "hsl(var(--border-primary-strongest))",
          weak: "hsl(var(--border-primary-weak))",
          weaker: "hsl(var(--border-primary-weaker))",
          weakest: "hsl(var(--border-primary-weakest))",
        }}
      />
      <ColorItem
        title="border-purple"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-purple))",
          weak: "hsl(var(--border-purple-weak))",
          weaker: "hsl(var(--border-purple-weaker))",
          weakest: "hsl(var(--border-purple-weakest))",
        }}
      />
      <ColorItem
        title="border-success"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-success))",
          weak: "hsl(var(--border-success-weak))",
          weaker: "hsl(var(--border-success-weaker))",
          weakest: "hsl(var(--border-success-weakest))",
        }}
      />
      <ColorItem
        title="border-warning"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--border-warning))",
          weak: "hsl(var(--border-warning-weak))",
          weaker: "hsl(var(--border-warning-weaker))",
          weakest: "hsl(var(--border-warning-weakest))",
        }}
      />
      <ColorItem
        title="data-visualization"
        subtitle=""
        colors={{
          1: "hsl(var(--data-visualization-1))",
          2: "hsl(var(--data-visualization-2))",
          3: "hsl(var(--data-visualization-3))",
          4: "hsl(var(--data-visualization-4))",
          5: "hsl(var(--data-visualization-5))",
          6: "hsl(var(--data-visualization-6))",
          7: "hsl(var(--data-visualization-7))",
          8: "hsl(var(--data-visualization-8))",
          9: "hsl(var(--data-visualization-9))",
          10: "hsl(var(--data-visualization-10))",
        }}
      />
      <ColorItem
        title="text"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text))",
          weak: "hsl(var(--text-weak))",
          weaker: "hsl(var(--text-weaker))",
          weakest: "hsl(var(--text-weakest))",
        }}
      />
      <ColorItem
        title="text-destructive"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-destructive))",
          strong: "hsl(var(--text-destructive-strong))",
          stronger: "hsl(var(--text-destructive-stronger))",
          strongest: "hsl(var(--text-destructive-strongest))",
          weak: "hsl(var(--text-destructive-weak))",
        }}
      />
      <ColorItem
        title="text-error"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-error))",
          strong: "hsl(var(--text-error-strong))",
          stronger: "hsl(var(--text-error-stronger))",
          strongest: "hsl(var(--text-error-strongest))",
          weak: "hsl(var(--text-error-weak))",
        }}
      />
      <ColorItem
        title="text-icon"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-icon))",
          error: "hsl(var(--text-icon-error))",
          info: "hsl(var(--text-icon-info))",
          inverse: "hsl(var(--text-icon-inverse))",
          success: "hsl(var(--text-icon-success))",
          warning: "hsl(var(--text-icon-warning))",
          weaker: "hsl(var(--text-icon-weaker))",
        }}
      />
      <ColorItem
        title="text-indigo"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-indigo))",
        }}
      />
      <ColorItem
        title="text-info"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-info))",
          strong: "hsl(var(--text-info-strong))",
        }}
      />
      <ColorItem
        title="text-inverse"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-inverse))",
          weak: "hsl(var(--text-inverse-weak))",
          weaker: "hsl(var(--text-inverse-weaker))",
          weakest: "hsl(var(--text-inverse-weakest))",
        }}
      />
      <ColorItem
        title="text-link"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-link))",
          strong: "hsl(var(--text-link-strong))",
          stronger: "hsl(var(--text-link-stronger))",
          strongest: "hsl(var(--text-link-strongest))",
          weak: "hsl(var(--text-link-weak))",
        }}
      />
      <ColorItem
        title="text-link-destructive"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-link-destructive))",
          strong: "hsl(var(--text-link-destructive-strong))",
          stronger: "hsl(var(--text-link-destructive-stronger))",
          strongest: "hsl(var(--text-link-destructive-strongest))",
          weak: "hsl(var(--text-link-destructive-weak))",
        }}
      />
      <ColorItem
        title="text-pink"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-pink))",
        }}
      />
      <ColorItem
        title="text-primary"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-primary))",
          strong: "hsl(var(--text-primary-strong))",
          stronger: "hsl(var(--text-primary-stronger))",
          strongest: "hsl(var(--text-primary-strongest))",
          weak: "hsl(var(--text-primary-weak))",
        }}
      />
      <ColorItem
        title="text-purple"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-purple))",
        }}
      />
      <ColorItem
        title="text-success"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-success))",
        }}
      />
      <ColorItem
        title="text-warning"
        subtitle=""
        colors={{
          DEFAULT: "hsl(var(--text-warning))",
          strong: "hsl(var(--text-warning-strong))",
        }}
      />
    </ColorPalette>
  ),
};
