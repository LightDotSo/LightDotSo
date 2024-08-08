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

import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { Bell, Signature, Users } from "lucide-react";
import type { FC, ReactNode } from "react";
import type { RefAttributes } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Feature {
  id: string;
  name: string;
  icon: (_props: { className?: string }) => ReactNode;
}

export interface FeatureList {
  name: string;
  description: string;
  features: Feature[];
}

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface FeatureCardProps {
  feature: Feature;
}

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const COLLABORATION_FEATURE_LIST: FeatureList = {
  name: "Collaboration",
  description: "Tailored to best suit your multi-sig capabilities for you",
  features: [
    {
      id: "unified-configuration",
      name: "Unified Configuration / Owners",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <Users {...props} />,
    },
    {
      id: "notification",
      name: "Notifications for Signatures",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <Bell {...props} />,
    },
    {
      id: "batch-transactions",
      name: "Batch Transactions",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <Signature {...props} />,
    },
  ],
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FeatureCard: FC<FeatureCardProps> = ({ feature }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative col-span-1 w-full rounded-md bg-background-stronger p-4">
      <feature.icon className="size-6 text-text" />
      <p className="mt-2 font-normal text-lg text-text">{feature?.name}</p>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface FeatureCardListProps {
  featureList: FeatureList;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FeatureCardList: FC<FeatureCardListProps> = ({ featureList }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative col-span-1 w-full rounded-md bg-background p-4">
      <div className="mt-2 font-bold font-normal text-lg text-text sm:text-2xl">
        {featureList?.name}
      </div>
      <div className="mt-1 text-text-weak">{featureList?.description}</div>
      <div className="mt-4 grid gap-2">
        {featureList?.features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Features: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center bg-background-stronger pt-8 pb-20">
      <div className="mt-5 grid w-full max-w-5xl grid-cols-2 gap-4">
        <FeatureCardList featureList={COLLABORATION_FEATURE_LIST} />
        <FeatureCardList featureList={COLLABORATION_FEATURE_LIST} />
      </div>
    </div>
  );
};
