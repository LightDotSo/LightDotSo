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

import { RootLink } from "./root-link";

export enum StepsEnum {
  // eslint-disable-next-line no-unused-vars
  New = "new",
  // eslint-disable-next-line no-unused-vars
  Settings = "settings",
  // eslint-disable-next-line no-unused-vars
  Confirm = "confirm",
}

export interface Step {
  enum: StepsEnum;
  id: string;
  name: string;
  href: string;
}

interface NewRootProps {
  children: React.ReactNode;
  currentStepType: StepsEnum;
}

export const steps: Step[] = [
  {
    enum: StepsEnum.New,
    id: "01",
    name: "Wallet Name",
    href: "/new",
  },
  {
    enum: StepsEnum.Settings,
    id: "02",
    name: "Wallet Settings",
    href: "/new/settings",
  },
  {
    enum: StepsEnum.Confirm,
    id: "03",
    name: "Confirm",
    href: "/new/confirm",
  },
];

export async function NewRoot({ currentStepType, children }: NewRootProps) {
  return (
    <div className="mt-8 flex flex-col space-y-8 lg:mt-12 lg:flex-row lg:space-x-12 lg:space-y-0">
      <div className="w-full flex-1 space-y-6">
        <nav aria-label="Progress">
          <ol className="divide-y divide-border rounded-md border border-border md:flex md:divide-y-0">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative md:flex md:flex-1">
                <RootLink
                  currentStepType={currentStepType}
                  stepType={step.enum}
                ></RootLink>
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
