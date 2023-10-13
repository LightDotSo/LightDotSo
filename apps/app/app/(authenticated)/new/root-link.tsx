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

import Link from "next/link";

import { cn } from "@lightdotso/utils";
import { steps, StepsEnum } from "./root";
import { CheckIcon } from "@heroicons/react/24/solid";

interface RootLinkProps {
  stepType: StepsEnum;
  currentStepType: StepsEnum;
}

export function RootLink({ currentStepType, stepType }: RootLinkProps) {
  const linkSteps = steps.map(step => {
    // Update the status of the step based on the current step
    if (step.enum === currentStepType) {
      return { ...step, status: "current" };
    }

    // If the current step is `new`, then we want to set the status as `upcoming`
    // for all other steps
    if (currentStepType === StepsEnum.New) {
      return { ...step, status: "upcoming" };
    }

    // If the current step is `settings`, then we want to set `new` as `complete` and `settings` as `upcoming`
    if (currentStepType === StepsEnum.Settings) {
      if (step.enum === StepsEnum.New) {
        return { ...step, status: "complete" };
      }

      return { ...step, status: "upcoming" };
    }

    // If the current step is `confirm`, then we want to set `new` and `settings` as `complete`
    if (
      currentStepType === StepsEnum.Confirm &&
      (step.enum === StepsEnum.New || step.enum === StepsEnum.Settings)
    ) {
      return { ...step, status: "complete" };
    }

    // Return the step w/ the status as `complete` for typing purposes
    return { ...step, status: "complete" };
  });

  // Get the step from the stepType
  const step =
    linkSteps.find(step => step.href.includes(stepType)) ?? linkSteps[0];

  return (
    <Link href={step.href} className="group flex w-full items-center">
      <span
        className={cn(
          stepType === StepsEnum.New &&
            "absolute left-0 top-0 h-full bg-transparent md:bottom-0 md:top-auto md:w-[calc(100%-1.25rem)]",
          stepType === StepsEnum.Settings &&
            "absolute left-0 top-0 h-full bg-transparent md:bottom-0 md:left-auto md:right-5 md:top-auto md:w-full",
          stepType === StepsEnum.Confirm &&
            "absolute left-0 top-0 h-full bg-transparent md:bottom-0 md:left-auto md:right-0 md:top-auto md:w-[calc(100%+1.25rem)]",
          // If the step is the current step, then we want to show the primary color
          // If the step is not the current step, then we want to show the muted color
          step.status === "current"
            ? "bg-primary w-1 md:h-1"
            : "bg-border w-0 md:h-0",
        )}
        aria-hidden="true"
      />
      <span className="flex items-center px-6 py-4 text-sm font-medium">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-card",
            step.status === "current" ? "border-primary" : "border-border",
          )}
        >
          {step.status === "complete" ? (
            <CheckIcon className="h-4 w-4 text-border" aria-hidden="true" />
          ) : (
            <span
              className={cn(
                step.status === "current" ? "text-primary" : "text-border",
              )}
            >
              {step.id}
            </span>
          )}
        </span>
        <span
          className={cn(
            "ml-4 text-sm font-medium",
            step.status === "current" ? "text-primary" : "text-border",
          )}
        >
          {step.name}
        </span>
      </span>
    </Link>
  );
}
