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

/* eslint-disable jsx-a11y/anchor-is-valid */
import { SocialLinks } from "@lightdotso/const";
import { Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  GlobeAltIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import type { FC } from "react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { SiReadthedocs } from "react-icons/si";
import { usePopper } from "react-popper";
import { Logo } from "@/components/Logo";

export const Header: FC = () => {
  let [communityElement, setCommunityElement] =
    useState<HTMLButtonElement | null>();
  let [communityPopperElement, setCommunityPopperElement] =
    useState<HTMLDivElement | null>();
  let communityPopper = usePopper(communityElement, communityPopperElement, {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 16],
        },
      },
    ],
  });

  let [resourceElement, setResourceElement] =
    useState<HTMLButtonElement | null>();
  let [resourcePopperElement, setResourcePopperElement] =
    useState<HTMLDivElement | null>();
  let resourcePopper = usePopper(resourceElement, resourcePopperElement, {
    placement: "bottom-end",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 16],
        },
      },
    ],
  });

  // const [isHeaderPanelOpen, setHeaderPanelOpen] = useState(false);

  // let timeout;
  // const timeoutDuration = 150;

  // const onCommunityHover = (open, action, event) => {
  //   if (
  //     (!open && communityElement && action === "onMouseEnter") ||
  //     (open &&
  //       !event.target.contains(communityElement) &&
  //       communityPopperElement &&
  //       action === "onMouseLeave")
  //   ) {
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => {
  //       return communityElement.click();
  //     }, timeoutDuration);
  //   }
  // };

  // const onResourceHover = (open, action, event) => {
  //   if (
  //     (!open && resourceElement && action === "onMouseEnter") ||
  //     (open &&
  //       !event.target.contains(resourceElement) &&
  //       resourcePopperElement &&
  //       action === "onMouseLeave")
  //   ) {
  //     clearTimeout(timeout);
  //     timeout = setTimeout(() => {
  //       return resourceElement.click();
  //     }, timeoutDuration);
  //   }
  // };

  return (
    <div className="absolute inset-x-0 top-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link
              passHref
              href="/"
              className="inline-flex items-center rounded-xl px-2 py-1.5 hover:bg-contrast-lower"
            >
              <Logo className="h-8 w-24 md:h-10 md:w-28" />
            </Link>
          </div>
          <div className="-my-2 md:hidden">
            <button className="focus:ring-primary inline-flex items-center justify-center rounded-md bg-bg p-2 text-contrast-medium hover:bg-contrast-low hover:text-contrast-higher focus:outline-none focus:ring-2 focus:ring-inset">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden flex-none flex-row gap-8 text-center md:flex">
            <Link
              passHref
              href="/lightpaper"
              className="text-base text-contrast-higher hover:text-contrast-high sm:self-center"
            >
              Lightpaper &#8599;
            </Link>
            <Popover>
              {({ open }) => {
                return (
                  <div className="flex flex-col">
                    <Popover.Button
                      ref={setCommunityElement}
                      className={clsx(
                        "flex items-center text-base shadow-none outline-none transition sm:self-center",
                        !open ? "text-contrast-higher" : "text-contrast-high",
                      )}
                    >
                      Communities
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </Popover.Button>
                    <Transition
                      enter="transition ease-out duration-133"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Popover.Panel
                        ref={setCommunityPopperElement}
                        style={communityPopper.styles.popper}
                        {...communityPopper.attributes.popper}
                        className="flex min-w-[160px] flex-col rounded-md bg-bg p-2"
                      >
                        <a
                          href={SocialLinks.Twitter}
                          target="_blank"
                          className="flex items-center rounded-md p-2 text-sm text-contrast-medium transition hover:bg-bg-lighter  hover:text-contrast-higher"
                          rel="noreferrer"
                        >
                          <span className="grow text-left">
                            Twitter <span className="ml-1.5">&#8599;</span>
                          </span>
                          <FaTwitter
                            className="-ml-0.5 h-4 w-4"
                            aria-hidden="true"
                          />
                        </a>
                        <a
                          href={SocialLinks.Discord}
                          target="_blank"
                          className="flex items-center rounded-md p-2 text-sm text-contrast-medium transition hover:bg-bg-lighter  hover:text-contrast-higher"
                          rel="noreferrer"
                        >
                          <span className="grow text-left">
                            Discord <span className="ml-1.5">&#8599;</span>
                          </span>
                          <FaDiscord
                            className="-ml-0.5 h-4 w-4"
                            aria-hidden="true"
                          />
                        </a>
                      </Popover.Panel>
                    </Transition>
                  </div>
                );
              }}
            </Popover>

            <Popover>
              {({ open }) => {
                return (
                  <div className="flex flex-col">
                    <Popover.Button
                      ref={setResourceElement}
                      className={clsx(
                        "flex items-center text-base shadow-none outline-none transition sm:self-center",
                        !open ? "text-contrast-higher" : "text-contrast-high",
                      )}
                    >
                      Resources
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </Popover.Button>
                    <Transition
                      enter="transition ease-out duration-133"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Popover.Panel
                        ref={setResourcePopperElement}
                        style={resourcePopper.styles.popper}
                        {...resourcePopper.attributes.popper}
                        className="flex min-w-[160px] flex-col rounded-md bg-bg p-2"
                      >
                        <Link
                          passHref
                          href="/docs"
                          className="flex items-center rounded-md p-2 text-sm text-contrast-medium transition hover:bg-bg-lighter  hover:text-contrast-higher"
                        >
                          <span className="grow text-left">
                            Docs <span className="ml-1.5">&#8599;</span>
                          </span>
                          <SiReadthedocs
                            className="-ml-0.5 h-4 w-4"
                            aria-hidden="true"
                          />
                        </Link>
                        <a
                          target="_blank"
                          href={SocialLinks.Github}
                          className="flex items-center rounded-md p-2 text-sm text-contrast-medium transition hover:bg-bg-lighter  hover:text-contrast-higher"
                          rel="noreferrer"
                        >
                          <span className="grow text-left">
                            Github <span className="ml-1.5">&#8599;</span>
                          </span>
                          <FaGithub
                            className="-ml-0.5 h-4 w-4"
                            aria-hidden="true"
                          />
                        </a>
                      </Popover.Panel>
                    </Transition>
                  </div>
                );
              }}
            </Popover>
          </div>
          <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            <a
              href={SocialLinks.Discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-transparent px-4 py-2 text-base text-contrast-higher hover:bg-contrast-medium xl:inline-flex"
            >
              <FaDiscord className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Discord
            </a>
            <Link
              passHref
              href="/explore"
              className="ml-4 inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-transparent bg-contrast-higher px-4 py-2 text-base text-contrast-lower shadow-sm hover:bg-contrast-high"
            >
              <GlobeAltIcon
                className="-ml-0.5 mr-2 h-4 w-4"
                aria-hidden="true"
              />
              Explore now
            </Link>
          </div>
        </div>
        {/* <HeaderPanel
          show={isHeaderPanelOpen}
          onClick={() => {
            return setHeaderPanelOpen(false);
          }}
        /> */}
      </div>
    </div>
  );
};
