"use client";

import { Caveat } from "next/font/google";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "./DraggableCards";
import { useConfig } from "@/lib/ConfigContext";

const handwriting = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// const images = [
//   "/pipis/pipi3.jpg",
//   "/pipis/pipi4.jpg",
//   "/pipis/pipi5.jpg",
//   "/pipis/pipi6.jpg",
//   "/pipis/pipi7.jpg",
//   // "/pipis/pipi8.jpg",
//   "/pipis/pipi9.jpg",
//   "/pipis/pipi10.jpg",
//   "/pipis/pipi11.jpg",
// ];

const images = [
  "/ref/girl2.jpg",
  "/ref/girl3.jpg",
  "/ref/girl4.jpg",
  "/ref/girl5.jpg",
  "/ref/girl6.jpg",
  "/ref/girl7.jpg",
  "/ref/girl8.jpg",
  "/ref/girl9.jpg",
  "/ref/girl10.jpg",
  "/ref/girl11.jpg",
];

const captions = [
  "Cutie 🥹",
  "Baddie 😎",
  "Pretty ✨",
  "My Love 🤍",
  "Sunshine ☀️",
  "Angel 🪽",
  "Beautiful 🌸",
  "Dream Girl 💫",
  "Queen 👑",
  "Always You 🫶",
];

const positions = [
  "top-[6%] left-[8%] rotate-[-11deg] sm:top-[8%] sm:left-[8%] sm:right-auto sm:bottom-auto sm:rotate-[-8deg]",
  "top-[10%] left-[58%] rotate-[9deg] sm:top-[15%] sm:left-[35%] sm:right-auto sm:bottom-auto sm:rotate-[6deg]",
  "top-[20%] left-[30%] rotate-[4deg] sm:top-[10%] sm:right-[10%] sm:left-auto sm:bottom-auto sm:rotate-[-5deg]",
  "top-[33%] left-[5%] rotate-[-8deg] sm:top-[45%] sm:left-[12%] sm:right-auto sm:bottom-auto sm:rotate-[7deg]",
  "top-[38%] left-[60%] rotate-[12deg] sm:top-[50%] sm:left-[40%] sm:right-auto sm:bottom-auto sm:rotate-[-6deg]",
  "top-[50%] left-[24%] rotate-[-5deg] sm:top-[40%] sm:right-[12%] sm:left-auto sm:bottom-auto sm:rotate-[10deg]",
  "top-[57%] left-[58%] rotate-[8deg] sm:top-auto sm:bottom-[10%] sm:left-[18%] sm:right-auto sm:rotate-[-10deg]",
  "top-[66%] left-[8%] rotate-[-12deg] sm:top-auto sm:bottom-[12%] sm:left-[45%] sm:right-auto sm:rotate-[5deg]",
  "top-[74%] left-[36%] rotate-[6deg] sm:top-auto sm:bottom-[8%] sm:right-[15%] sm:left-auto sm:rotate-[-7deg]",
  "top-[80%] left-[62%] rotate-[-7deg] sm:top-[28%] sm:right-[22%] sm:left-auto sm:bottom-auto sm:rotate-[4deg]",
];

export default function LoveGallery() {
  const { config } = useConfig();
  const displayImages = config.photos && config.photos.length > 0 ? config.photos.slice(1, 11) : images;
  const displayCaptions = config.loveGalleryCaptions && config.loveGalleryCaptions.length > 0 ? config.loveGalleryCaptions : captions;

  return (
    <DraggableCardContainer
      className="
        relative
        min-h-[100dvh]
        h-[100dvh]
        w-full
        overflow-hidden
        bg-[#d9d3c7]

        before:absolute
        before:inset-0
        before:pointer-events-none
        before:bg-[linear-gradient(rgba(120,110,90,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(120,110,90,0.12)_1px,transparent_1px)]
        before:bg-[size:30px_30px] sm:before:bg-[size:40px_40px]

        after:absolute
        after:inset-0
        after:pointer-events-none
        after:bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.08))]
      "
    >


      {displayImages.map((img, index) => (
        <DraggableCardBody
          key={img + index}
          className={`
            absolute
            ${positions[index % positions.length]}
            bg-white
            rounded-xl
            shadow-2xl
            max-sm:rounded-lg
            max-sm:shadow-lg
            max-sm:p-1.5
            p-3
            max-sm:w-fit
            max-sm:max-w-fit
            overflow-visible
            cursor-grab
            active:cursor-grabbing
            touch-none
            select-none
            z-10
            hover:scale-[1.03]
          `}
        >
          <div className="relative overflow-visible">
            <img
              src={img}
              alt={displayCaptions[index % displayCaptions.length]}
              draggable={false}
              className="
                h-20
                w-20
                xs:h-24
                xs:w-24
                sm:h-56
                sm:w-56
                rounded-md
                sm:rounded-lg
                object-cover
                pointer-events-none
                select-none
              "
            />

            <div
              className="
                absolute
                -top-2
                -right-2
                sm:-top-7
                sm:-right-7
                text-base
                xs:text-lg
                sm:text-5xl
                z-50
                pointer-events-none
                drop-shadow-md
              "
            >
              ❤️
            </div>

            <p
              className={`
                mt-1
                sm:mt-3
                text-center
                text-neutral-700
                text-xs
                xs:text-sm
                sm:text-3xl
                font-semibold
                ${handwriting.className}
                pointer-events-none
                leading-tight
              `}
            >
              {displayCaptions[index % displayCaptions.length]}
            </p>
          </div>
        </DraggableCardBody>
      ))}

      <div
        className="
          absolute
          top-14
          left-6
          sm:top-20
          sm:left-20
          text-3xl
          sm:text-5xl
          opacity-30
          pointer-events-none
        "
      >
        ✿
      </div>

      <div
        className="
          absolute
          bottom-14
          right-6
          sm:bottom-20
          sm:right-20
          text-3xl
          sm:text-5xl
          opacity-30
          pointer-events-none
        "
      >
        ♡
      </div>

      <div
        className="
          absolute
          top-[45%]
          right-[4%]
          text-2xl
          sm:text-4xl
          opacity-30
          pointer-events-none
        "
      >
        ✨
      </div>
    </DraggableCardContainer>
  );
}