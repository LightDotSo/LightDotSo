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

import { CheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { cn } from "@lightdotso/utils";

export enum StepsEnum {
  // eslint-disable-next-line no-unused-vars
  New = "new",
  // eslint-disable-next-line no-unused-vars
  Settings = "settings",
  // eslint-disable-next-line no-unused-vars
  Confirm = "confirm",
}

interface Step {
  id: string;
  name: string;
  href: string;
  status: string;
}

interface NewRootProps {
  children: React.ReactNode;
  stepType: StepsEnum;
}

export async function NewRoot({ stepType, children }: NewRootProps) {
  let steps: Step[] = [
    { id: "01", name: "Wallet Name", href: "/new", status: "complete" },
    {
      id: "02",
      name: "Wallet Settings",
      href: "/new/settings",
      status: "current",
    },
    { id: "03", name: "Confirm", href: "/new/confirm", status: "upcoming" },
  ];

  steps = steps.map(step => {
    if (step.href.includes(stepType)) {
      return { ...step, status: "current" };
    }

    return step;
  });

  return (
    <div className="mt-8 flex flex-col space-y-8 lg:mt-12 lg:flex-row lg:space-x-12 lg:space-y-0">
      <div className="w-full flex-1 space-y-6">
        <nav aria-label="Progress">
          <ol className="divide-y divide-border rounded-md border border-border md:flex md:divide-y-0">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative md:flex md:flex-1">
                {step.id === "01" ? (
                  <Link
                    href={step.href}
                    className="group flex w-full items-center"
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 bg-transparent md:bottom-0 md:top-auto md:h-1 md:w-[calc(100%-1.25rem)]",
                        stepType === StepsEnum.New
                          ? "bg-primary/70"
                          : " group-hover:bg-primary/40",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
                        <CheckIcon
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                      <span
                        className={cn(
                          "ml-4 text-sm font-medium",
                          stepType === StepsEnum.New
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-muted-foreground/80",
                        )}
                      >
                        {step.name}
                      </span>
                    </span>
                  </Link>
                ) : step.id === "02" ? (
                  <Link
                    href={step.href}
                    className="group flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-0 h-full w-1 bg-transparent md:bottom-0 md:left-auto md:right-5 md:top-auto md:h-1 md:w-full",
                        stepType === StepsEnum.Settings
                          ? "bg-primary/80"
                          : "group-hover:bg-primary/40",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border">
                      <span className="text-primary">{step.id}</span>
                    </span>
                    <span
                      className={cn(
                        "ml-4 text-sm font-medium text-primary",
                        stepType === StepsEnum.Settings
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-muted-foreground/80",
                      )}
                    >
                      {step.name}
                    </span>
                  </Link>
                ) : (
                  <Link href={step.href} className="group flex items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span
                        className={cn(
                          "absolute left-0 top-0 h-full w-1 bg-transparent md:bottom-0 md:left-auto md:right-0 md:top-auto md:h-1 md:w-[calc(100%+1.25rem)]",
                          stepType === StepsEnum.Confirm
                            ? "bg-primary"
                            : "group-hover:bg-primary/40",
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border">
                        <span className="text-muted-foreground">{step.id}</span>
                      </span>
                      <span
                        className={cn(
                          "ml-4 text-sm font-medium text-muted-foreground group-hover:text-primary",
                          stepType === StepsEnum.Confirm
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-muted-foreground/80",
                        )}
                      >
                        {step.name}
                      </span>
                    </span>
                  </Link>
                )}
                {stepIdx !== steps.length - 1 ? (
                  <>
                    <div
                      className="absolute right-0 top-0 hidden h-full w-5 md:block"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-full w-full text-border"
                        viewBox="0 0 22 80"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 -2L20 40L0 82"
                          vectorEffect="non-scaling-stroke"
                          stroke="currentcolor"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mx-auto flex h-96 flex-col rounded-md border border-border bg-card">
          <div className="mt-20 flex justify-center"></div>
        </div>
      </div>
      <aside className="lg:w-1/4">
        <div className="h-96 rounded-md border border-border bg-card">
          {children}
        </div>
      </aside>
    </div>
  );
}
