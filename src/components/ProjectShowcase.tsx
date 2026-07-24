"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";

const REPEAT = 9;
const MIDDLE_COPY = Math.floor(REPEAT / 2);
const ITEM_WIDTH = 200;

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const captionContainerRef = useRef<HTMLDivElement>(null);
  const captionTrackRef = useRef<HTMLDivElement>(null);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const lastRoundedRef = useRef<number>(0);
  const [activeAbsoluteIndex, setActiveAbsoluteIndex] = useState(0);
  const count = projects.length;

  const loopedProjects = Array.from({ length: REPEAT }, () => projects).flat();

  const updateCaptionTransform = (progress: number) => {
    const container = captionContainerRef.current;
    const captionTrack = captionTrackRef.current;
    if (!container || !captionTrack) return;
    const centerX = container.clientWidth / 2 - ITEM_WIDTH / 2 - progress * ITEM_WIDTH;
    captionTrack.style.transform = `translateX(${centerX}px)`;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const initialIndex = MIDDLE_COPY * count;
    track.scrollLeft = initialIndex * track.clientWidth;
    lastRoundedRef.current = initialIndex;
    setActiveAbsoluteIndex(initialIndex);
    updateCaptionTransform(initialIndex);
  }, [count]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    };

    const handleScroll = () => {
      const slideWidth = track.clientWidth;
      if (!slideWidth) return;
      const progress = track.scrollLeft / slideWidth;
      updateCaptionTransform(progress);

      const rounded = Math.round(progress);
      if (rounded !== lastRoundedRef.current) {
        lastRoundedRef.current = rounded;
        setActiveAbsoluteIndex(rounded);
      }

      if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
      scrollEndTimeout.current = setTimeout(() => {
        const idx = Math.round(track.scrollLeft / slideWidth);
        const currentCopy = Math.floor(idx / count);
        if (currentCopy !== MIDDLE_COPY) {
          track.scrollLeft += (MIDDLE_COPY - currentCopy) * count * slideWidth;
        }
      }, 150);
    };

    const handleResize = () => {
      const slideWidth = track.clientWidth;
      if (!slideWidth) return;
      updateCaptionTransform(track.scrollLeft / slideWidth);
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (scrollEndTimeout.current) clearTimeout(scrollEndTimeout.current);
      if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);
    };
  }, [count]);

  const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

  const animateScrollTo = (targetLeft: number, duration = 500) => {
    const track = trackRef.current;
    if (!track) return;
    if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);

    // Scroll-snap fights programmatic scrollLeft writes by yanking them back
    // to the nearest snap point on every frame, so it must be switched off
    // for the duration of the animation and restored once we land exactly
    // on the target (which is already snap-aligned).
    track.style.scrollSnapType = "none";

    const startLeft = track.scrollLeft;
    const delta = targetLeft - startLeft;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = startLeft + delta * easeInOutQuad(t);
      if (t < 1) {
        scrollAnimationRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimationRef.current = null;
        track.style.scrollSnapType = "";
      }
    };
    scrollAnimationRef.current = requestAnimationFrame(step);
  };

  const shiftBy = (offset: number) => {
    const track = trackRef.current;
    if (!track) return;
    animateScrollTo(track.scrollLeft + offset * track.clientWidth);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div
        ref={trackRef}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loopedProjects.map((project, i) => (
          <div
            key={`${project.slug}-${i}`}
            className="relative h-full w-full flex-shrink-0 snap-center snap-always"
          >
            <Image
              src={project.image}
              alt={`${project.artist} — ${project.track}`}
              fill
              priority
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black/85 to-transparent" />

      <div
        ref={captionContainerRef}
        className="absolute inset-x-page bottom-page z-10 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}
      >
        <div ref={captionTrackRef} className="flex">
          {loopedProjects.map((project, i) => {
            const isActive = i === activeAbsoluteIndex;

            return (
              <button
                key={i}
                type="button"
                onClick={() => shiftBy(i - activeAbsoluteIndex)}
                disabled={isActive}
                style={{ width: ITEM_WIDTH }}
                className={`font-caption flex shrink-0 flex-col items-center justify-center px-1 text-center leading-[1.1] uppercase ${
                  isActive ? "text-white" : "text-zinc-500 transition-colors hover:text-zinc-300"
                }`}
              >
                <span className="w-full truncate text-base font-semibold">{project.track}</span>
                <span className="w-full truncate text-base font-medium">{project.artist}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
