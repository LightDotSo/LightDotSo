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

import clsx from "clsx";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import type { FC } from "react";
import { Mousewheel, Pagination, Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

import "swiper/css";

const carousels = [
  {
    name: "Your Web3 Hub",
    title: "Web3 Home",
    body: "Your personal web3 suite.\nConnect and discover what's happening across the blockchain.\nExplore the world of web3 with zero friction and simplicity.",
    image: "/web3Home.png",
  },
  {
    name: "Light Protocol",
    title: "Earn with web3",
    body: "Your personal web3 suite.\nConnect and discover what's happening across the blockchain.\nExplore the world of web3 with zero friction and simplicity.",
    image: "/lightProtocol.png",
  },
  {
    name: "Social Credentials",
    title: "Connect on web3",
    body: "One place to showcase your web3 credentials & reputation.\nAccumulate scores and boost your reputation and compete with your friends!",
    image: "/socialCredentials.png",
  },
];

export const CarouselButton: FC<{ index: number }> = ({
  index,
}: {
  index: number;
}) => {
  const swiper = useSwiper();

  return (
    <div className="my-8 flex items-center justify-center space-x-2">
      <button
        className={clsx(
          "h-2.5 w-2.5 rounded-full bg-emphasis-medium",
          index === 0 && "bg-contrast-high",
          index === 1 && "bg-emphasis-medium",
        )}
        onClick={() => {
          return swiper.slideTo(1);
        }}
      />
      <button
        className={clsx(
          "h-2.5 w-2.5 rounded-full bg-emphasis-medium",
          index === 1 && "bg-contrast-high",
          index === 2 && "bg-emphasis-medium",
        )}
        onClick={() => {
          return swiper.slideTo(2);
        }}
      />
      <button
        className={clsx(
          "h-2.5 w-2.5 rounded-full bg-emphasis-medium",
          index === 2 && "bg-contrast-high",
          index === 3 && "bg-emphasis-medium",
        )}
        onClick={() => {
          return swiper.slideTo(0);
        }}
      />
    </div>
  );
};

export const CarouselText: FC<{ index: number }> = ({
  index,
}: {
  index: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(false);
    }, 300);
  }, [index]);

  return (
    <div
      className={clsx(
        "my-8 max-w-4xl whitespace-pre-line transition-opacity",
        fade
          ? "opacity-0 duration-300"
          : "opacity-100 duration-700 ease-in-out",
      )}
    >
      <div className="uppercase text-contrast-high lg:mb-2">
        {carousels[currentIndex % 3].name}
      </div>
      <h2 className="font-clash text-2xl font-extrabold text-contrast-higher sm:tracking-tight lg:mb-4 xl:text-6xl">
        {carousels[currentIndex % 3].title}
      </h2>
      <p className="text-base text-contrast-high lg:text-2xl ">
        {carousels[currentIndex % 3].body}
      </p>
    </div>
  );
};

export const Carousel: FC = () => {
  const [index, setIndex] = useState(0);

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-24 lg:mb-32 lg:pt-48">
      <div className="mb-8 bg-bg-darker text-left lg:mb-16">
        <h1 className="font-clash text-4xl font-extrabold text-contrast-higher sm:tracking-tight lg:mb-4 xl:text-7xl">
          Lightpaper
        </h1>
        <p className="text-lg text-contrast-high lg:text-2xl ">
          A leap of faith is the path to the light side.
        </p>
      </div>
      <div className="relative hidden w-full gap-12 pb-14 md:block">
        <Swiper
          loop
          navigation
          spaceBetween={50}
          slidesPerView={1}
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true }}
          speed={1000}
          autoplay={{
            delay: 3000,
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          modules={[Autoplay, Mousewheel, Navigation, Pagination]}
          onSlideChange={s => {
            setIndex(s.realIndex);
          }}
        >
          {carousels.map((carousel, i) => {
            return (
              <SwiperSlide key={i}>
                <div className="shrink-0 px-3.5 md:block">
                  <Image
                    priority
                    src={carousel.image}
                    alt={carousel.name}
                    width={1270}
                    height={760}
                    layout="intrinsic"
                    className="pointer-events-none rounded-md object-fill object-center lg:rounded-xl"
                    objectPosition="center bottom"
                    draggable="false"
                  />
                </div>
              </SwiperSlide>
            );
          })}
          <CarouselButton index={index} />
          <CarouselText index={index} />
        </Swiper>
      </div>
      <div className="relative w-full gap-12 overflow-x-auto pb-14 md:hidden">
        {carousels.map((carousel, i) => {
          return (
            <div key={i}>
              <Image
                priority
                src={carousel.image}
                alt={carousel.name}
                width={672}
                height={672}
                layout="intrinsic"
                objectFit="cover"
                className="pointer-events-none rounded-md object-cover object-center lg:rounded-xl"
                objectPosition="center bottom"
                draggable="false"
              />
              <div className="my-8 max-w-4xl">
                <div className="uppercase text-contrast-high lg:mb-2 ">
                  {carousel.name}
                </div>
                <h2 className="font-clash text-2xl font-extrabold text-contrast-higher sm:tracking-tight lg:mb-4 xl:text-6xl">
                  {carousel.title}
                </h2>
                <p className="text-base text-contrast-high lg:text-2xl ">
                  {carousel.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
