"use client";

import React from "react";
import MarqueeAlongSvgPath from "../LineCmp";
import { useConfig } from "@/lib/ConfigContext";

const path =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

// Local photos from /public/ref — resolve to /ref/*.jpg at runtime.
const imgs = [
  { src: "/ref/heart.jpg" },
  { src: "/ref/girl.jpg" },
  { src: "/ref/girl2.jpg" },
  { src: "/ref/girl3.jpg" },
  { src: "/ref/girl4.jpg" },
  { src: "/ref/girl5.jpg" },
  { src: "/ref/girl6.jpg" },
  { src: "/ref/girl7.jpg" },
  { src: "/ref/girl8.jpg" },
  { src: "/ref/girl9.jpg" },
  { src: "/ref/girl10.jpg" },
  { src: "/ref/girl11.jpg" },
];

// const imgs = [
//   { src: "/pipis/pipi1.jpg" },
//   { src: "/pipis/pipi2.jpg" },
//   { src: "/pipis/pipi3.jpg" },
//   { src: "/pipis/pipi4.jpg" },
//   { src: "/pipis/pipi5.jpg" },
//   { src: "/pipis/pipi6.jpg" },
//   { src: "/pipis/pipi7.jpg" },
//   { src: "/pipis/pipi8.jpg" },
//   { src: "/pipis/pipi9.jpg" },
//   { src: "/pipis/pipi10.jpg" },
//   { src: "/pipis/pipi11.jpg" },
//   { src: "/pipis/pipi12.jpg" },
//   { src: "/pipis/pipi13.jpg" },
//   { src: "/pipis/pipi14.jpg" },
// ];



export const HeroSection = () => {
  const { config } = useConfig();
  const displayImgs = (config.photos && config.photos.length > 0 ? config.photos : imgs.map(i => i.src)).map(src => ({ src }));

  return (
    <section className="relative overflow-hidden flex min-h-[100dvh] h-[100dvh] w-full flex-col overflow-x-hidden bg-[#FAFAF7]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Work+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap");

        .hero-display {
          font-family: "Bricolage Grotesque", sans-serif;
        }
        .hero-body {
          font-family: "Work Sans", sans-serif;
        }
        .hero-mono {
          font-family: "JetBrains Mono", monospace;
        }
      `}</style>

      {/* Top row: quiet date stamp */}
      <div className="hero-mono flex items-center justify-between px-6 pt-5 text-[11px] uppercase tracking-[0.25em] text-[#8A8A80] sm:px-14 sm:pt-8 z-20">
        <span>{config.person.heroDateBadge || "Aug 5"}</span>
      </div>

      {/* Headline & content — film trail positioned between headline and text on mobile */}
      <div className="px-6 pt-3 xs:pt-6 sm:px-14 sm:pt-16 z-20 relative flex flex-col flex-1 justify-between sm:justify-start pb-6 sm:pb-0">
        <h1 className="hero-display text-[13.5vw] sm:text-7xl lg:text-8xl leading-[0.88] tracking-tight text-[#14140F]">
          <span className="font-light">Happy</span>
          <br />
          <span className="font-bold">Birthday</span>
          <br/>
          <span className="font-bold mt-1 mb-2 text-amber-500">{config.person.name || "Sweety"}</span>
        </h1>

        {/* Mobile film trail — continuous film strip with zero space between pics and clear separation from headline */}
        <div className="block sm:hidden mt-24 xs:mt-28 mb-3 w-[996px] left-1/2 -translate-x-1/2 relative overflow-visible h-[270px] pointer-events-auto -rotate-2">
          <MarqueeAlongSvgPath
            path={path}
            viewBox="0 0 996 330"
            width="100%"
            height="100%"
            baseVelocity={5}
            slowdownOnHover={true}
            draggable={true}
            repeat={2}
            dragSensitivity={0.08}
            dragVelocityDecay={0.98}
            slowDownFactor={0.05}
            slowDownSpringConfig={{ damping: 60, stiffness: 300 }}
            className="w-full h-full"
            responsive
            grabCursor
          >
            {displayImgs.map((img, i) => (
              <div
                key={i}
                className="h-[68px] w-[74px] overflow-hidden border border-[#14140F]/15 bg-[#14140F]/10 rounded-none transition-transform duration-300 ease-out hover:scale-105 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={`Memory ${i + 1}`}
                  className="h-full w-full object-cover grayscale transition-[filter] duration-300 ease-out hover:grayscale-0"
                  draggable={false}
                />
              </div>
            ))}
          </MarqueeAlongSvgPath>
        </div>

        {/* Desktop film trail — untouched, mid-screen absolute */}
        <div className="hidden sm:block sm:absolute sm:top-52 sm:bottom-auto sm:left-1/2 sm:w-screen sm:-rotate-10 sm:-translate-x-1/2 sm:z-10 pointer-events-auto sm:mx-0 overflow-visible h-[300px]">
          <MarqueeAlongSvgPath
            path={path}
            viewBox="0 0 996 330"
            width="100%"
            height="300"
            baseVelocity={5}
            slowdownOnHover={true}
            draggable={true}
            repeat={2}
            dragSensitivity={0.08}
            dragVelocityDecay={0.98}
            slowDownFactor={0.05}
            slowDownSpringConfig={{ damping: 60, stiffness: 300 }}
            className="w-full h-full"
            responsive
            grabCursor
          >
            {displayImgs.map((img, i) => (
              <div
                key={i}
                className="h-14 w-14 overflow-hidden border border-[#14140F]/15 bg-[#14140F]/5 rounded-sm transition-transform duration-300 ease-out hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={`Memory ${i + 1}`}
                  className="h-full w-full object-cover grayscale transition-[filter] duration-300 ease-out hover:grayscale-0"
                  draggable={false}
                />
              </div>
            ))}
          </MarqueeAlongSvgPath>
        </div>

        <div className="mt-2 xs:mt-4 sm:mt-6">
          <div className="h-px w-20 bg-[#9C7A3F]" />
          <p className="hero-body mt-3 xs:mt-4 sm:mt-6 max-w-sm sm:max-w-sm text-base xs:text-lg sm:text-base leading-[1.65] text-[#2c2c26]">
            {config.person.heroWishMessage || "wishing you a day filled with love, laughter, and all the happiness your heart can hold. May this year bring you endless joy and unforgettable memories. Happy Birthday!"}
          </p>
        </div>
      </div>

      {/* Footer hairline */}
      <div className="mt-auto flex items-center justify-between px-6 pb-5 sm:px-14 sm:pb-8 z-20">
        <div className="h-px flex-1 bg-[#14140F]/10" />
        <span className="hero-mono px-4 text-[10px] uppercase tracking-[0.25em] text-[#8A8A80]">
          Made for you
        </span>
      </div>
    </section>
  );
};
