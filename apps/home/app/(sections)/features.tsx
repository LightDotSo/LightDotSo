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
import {
  ArrowLeftRight,
  Bell,
  Fuel,
  Gem,
  GitCompareArrows,
  LineChart,
  LucideGlobe,
  ScanEyeIcon,
  ShieldCheck,
  Signature,
  Users,
} from "lucide-react";
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
// Component
// -----------------------------------------------------------------------------

export const Features: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative z-10 flex flex-col items-center justify-center bg-background-stronger p-4 pt-8 pb-20">
      <div className="mt-5 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        <FeatureCardList featureList={COLLABORATION_FEATURE_LIST} />
        <FeatureCardList featureList={SEAMLESS_FEATURE_LIST} />
        <FeatureCardList featureList={VISUALIZE_FEATURE_LIST} />
        <FeatureCardList featureList={SECURITY_FEATURE_LIST} />
      </div>
    </div>
  );
};

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

const SEAMLESS_FEATURE_LIST: FeatureList = {
  name: "Seamless",
  description: "Navigate Ethereum without the hassle",
  features: [
    {
      id: "gas-abstraction",
      name: "Gas Abstraction",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <Fuel {...props} />,
    },
    {
      id: "batch-execution",
      name: "Batch Execution / Signatures",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <ArrowLeftRight {...props} />,
    },
    {
      id: "all-in-one-account",
      name: "All-in-One Account",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <LucideGlobe {...props} />,
    },
  ],
};

const VISUALIZE_FEATURE_LIST: FeatureList = {
  name: "Visualize",
  description: "Visualize your assets and transactions across chains",
  features: [
    {
      id: "portfolio-tracker",
      name: "In-depth Portfolio Tracker",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <LineChart {...props} />,
    },
    {
      id: "token-dashboard",
      name: "Omni-Chain Token Dashboard",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <Gem {...props} />,
    },
    {
      id: "human-readable",
      name: "Human Readable Transactions",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <ScanEyeIcon {...props} />,
    },
  ],
};

const SECURITY_FEATURE_LIST: FeatureList = {
  name: "Security",
  description: "Security is our top priority",
  features: [
    {
      id: "activity",
      name: "Traceable Activity Across Chains",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <Users {...props} />,
    },
    {
      id: "simulation",
      name: "Transaction Simulation + Security",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <GitCompareArrows {...props} />,
    },
    {
      id: "open-source",
      name: "100% Open Source",
      icon: (
        // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
        props: JSX.IntrinsicAttributes &
          IconProps &
          RefAttributes<SVGSVGElement>,
      ) => <ShieldCheck {...props} />,
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
    <div className="relative col-span-1 w-full rounded-lg bg-background-stronger p-4">
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
    <div className="col-span-1 w-full rounded-lg bg-background-weak p-4">
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
