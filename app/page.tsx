"use client";

import { useConfig } from "@/lib/ConfigContext";
import ShowtimeCountdown from "@/components/Curtain";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// --- Lazy load heavy components (only load when user scrolls near them) ---
const HeroSection = dynamic(
  () => import("../components/sections/HeroSection").then((m) => ({ default: m.HeroSection })),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-50 dark:bg-black" /> }
);

const FloatingNotes = dynamic(() => import("@/components/Butterfly"), {
  ssr: false,
  loading: () => null,
});

const LoveGallery = dynamic(() => import("@/components/LoveGallery"), {
  ssr: false,
  loading: () => null,
});

const DoodleBackgroundDemo = dynamic(() => import("@/components/DoodleBg"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900" />,
});

// Three.js / WebGL — load last, heaviest bundle
const StellarCardGallerySingle = dynamic(() => import("@/components/NewWorld"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <span className="text-white/40 text-sm animate-pulse">Loading galaxy…</span>
    </div>
  ),
});

// Intersection-aware section wrapper — only renders children once visible
function LazySection({
  id,
  className,
  children,
  rootMargin = "200px",
}: {
  id: string;
  className: string;
  children: React.ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <section id={id} className={className} ref={ref}>
      {visible ? children : null}
    </section>
  );
}

export default function Home() {
  const { config } = useConfig();

  // Forward live config updates to child iframes
  useEffect(() => {
    if (!config) return;
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((ifr) => {
      try {
        ifr.contentWindow?.postMessage({ type: "config_updated", config }, "*");
      } catch (_) {}
    });
  }, [config]);

  const sectionClass =
    "h-[100dvh] min-h-[100dvh] w-full snap-start snap-always shrink-0 overflow-hidden relative z-10";

  return (
    <ShowtimeCountdown
      showPreviewButton={config.countdown.showPreviewButton}
      targetDate={new Date(config.countdown.targetDate)}
      tickerText={config.countdown.tickerText}
      marqueeTitle={config.countdown.marqueeTitle}
      marqueeSub={config.countdown.marqueeSub}
      doorsText={config.countdown.doorsText}
      songSrc={config.music.songSrc}
    >
      <div
        id="main-scroll-container"
        className="h-full min-h-[100dvh] w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory bg-zinc-50 dark:bg-black select-none scroll-smooth"
      >
        {/* Section 1: Birthday Counter iframe — load immediately (first view) */}
        <section id="section-1" className={sectionClass}>
          <iframe
            src="/birthday.html"
            title="Birthday Reveal"
            className="w-full h-full border-none block"
            allow="autoplay"
            loading="eager"
          />
        </section>

        {/* Section 2: Hero — load when near */}
        <LazySection id="section-2" className={sectionClass}>
          <HeroSection />
        </LazySection>

        {/* Section 3: Notes + Gallery — load when near */}
        <LazySection id="section-3" className={sectionClass}>
          <FloatingNotes />
          <LoveGallery />
        </LazySection>

        {/* Section 4: Doodle Scrapbook — load when near */}
        <LazySection id="section-4" className={sectionClass}>
          <DoodleBackgroundDemo />
        </LazySection>

        {/* Section 5: 3D Galaxy — load late (heaviest, rootMargin small) */}
        <LazySection id="section-5" className={sectionClass} rootMargin="100px">
          <StellarCardGallerySingle />
        </LazySection>

        {/* Section 6: iMessage Finale — iframe lazy */}
        <LazySection id="section-6" className={sectionClass} rootMargin="100px">
          <iframe
            src="/last.html"
            title="Birthday Finale Message"
            className="w-full h-full border-none block"
            allow="autoplay"
            loading="lazy"
          />
        </LazySection>
      </div>
    </ShowtimeCountdown>
  );
}
