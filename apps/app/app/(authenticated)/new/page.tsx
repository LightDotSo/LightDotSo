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

const steps = [
  { id: "01", name: "Wallet Name", href: "#", status: "complete" },
  { id: "02", name: "Wallet Settings", href: "#", status: "current" },
  { id: "03", name: "Preview", href: "#", status: "upcoming" },
];

export default async function Page() {
  return (
    <div className="mt-8 flex flex-col space-y-8 lg:mt-12 lg:flex-row lg:space-x-12 lg:space-y-0">
      <div className="w-full flex-1 space-y-6">
        <nav aria-label="Progress">
          <ol className="divide-y divide-border rounded-md border border-border md:flex md:divide-y-0">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative md:flex md:flex-1">
                {step.status === "complete" ? (
                  <a
                    href={step.href}
                    className="group flex w-full items-center"
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary/70 md:bottom-0 md:top-auto md:h-1 md:w-[calc(100%-1.25rem)]"
                      aria-hidden="true"
                    />
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card">
                        <CheckIcon
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="ml-4 text-sm font-medium text-muted-foreground group-hover:text-muted-foreground/80">
                        {step.name}
                      </span>
                    </span>
                  </a>
                ) : step.status === "current" ? (
                  <a
                    href={step.href}
                    className="group flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary/80 md:bottom-0 md:left-auto md:right-5 md:top-auto md:h-1 md:w-full"
                      aria-hidden="true"
                    />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border">
                      <span className="text-primary">{step.id}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-primary">
                      {step.name}
                    </span>
                  </a>
                ) : (
                  <a href={step.href} className="group flex items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span
                        className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary md:bottom-0  md:left-auto md:right-0 md:top-auto md:h-1 md:w-[calc(100%+1.25rem)]"
                        aria-hidden="true"
                      />
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border">
                        <span className="text-muted-foreground">{step.id}</span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-muted-foreground group-hover:text-primary">
                        {step.name}
                      </span>
                    </span>
                  </a>
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
        <div className="h-96 rounded-md border border-border bg-card"></div>
      </aside>
    </div>
  );
}
