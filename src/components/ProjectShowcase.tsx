"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { useTransitionNavigate } from "@/components/PageTransition";
import { useSetHomeAppearance } from "@/components/HomeAppearance";

// How many slides on either side of the active one keep their video loaded.
// Everything outside this window renders no <video> at all, so we're never
// trying to autoplay every single copy of every project at once.
const LOAD_RADIUS = 2;

const REPEAT = 9;
const MIDDLE_COPY = Math.floor(REPEAT / 2);
const ITEM_WIDTH = 200;

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const navigate = useTransitionNavigate();
  const setAppearance = useSetHomeAppearance();
  const trackRef = useRef<HTMLDivElement>(null);
  const captionContainerRef = useRef<HTMLDivElement>(null);
  const captionTrackRef = useRef<HTMLDivElement>(null);
  const scrollEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelLockRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoundedRef = useRef<number>(0);
  const [activeAbsoluteIndex, setActiveAbsoluteIndex] = useState(0);
  const count = projects.length;

  const loopedProjects = Array.from({ length: REPEAT }, () => projects).flat();

  // Each project picks its own header/caption text color (to match its own
  // cover video), so the header (rendered outside this component) needs to
  // be told which one is currently active.
  useEffect(() => {
    const project = loopedProjects[activeAbsoluteIndex];
    if (!project) return;
    setAppearance({ headerColor: project.homeHeaderColor, captionColor: project.homeCaptionColor });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAbsoluteIndex]);

  const updateCaptionTransform = (progress: number) => {
    const container = captionContainerRef.current;
    const captionTrack = captionTrackRef.current;
    if (!container || !captionTrack) return;
    const centerX = container.clientWidth / 2 - ITEM_WIDTH / 2 - progress * ITEM_WIDTH;
    captionTrack.style.transform = `translateX(${centerX}px)`;
  };

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

    // Directly mutating scrollLeft (or scrollBy with a small delta) gets
    // silently rejected by this snap container outside of a native scroll
    // gesture. So instead of tracking the wheel continuously, each gesture
    // just accumulates until it crosses a threshold, then triggers one
    // animated step to the next/previous project (the same animation the
    // caption clicks use) and locks out further steps until it's done.
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      if (wheelLockRef.current) return;

      wheelAccumRef.current += e.deltaY;
      const THRESHOLD = 60;
      if (Math.abs(wheelAccumRef.current) < THRESHOLD) return;

      const direction = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      shiftBy(direction);
      wheelLockRef.current = setTimeout(() => {
        wheelLockRef.current = null;
      }, 550);
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
      if (wheelLockRef.current) clearTimeout(wheelLockRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div
        ref={trackRef}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loopedProjects.map((project, i) => {
          const inLoadRange = Math.abs(i - activeAbsoluteIndex) <= LOAD_RADIUS;

          return (
            <div
              key={`${project.slug}-${i}`}
              className="relative h-full w-full flex-shrink-0 snap-center snap-always"
            >
              {inLoadRange &&
                (project.homeCover.type === "image" ? (
                  <Image
                    src={project.homeCover.src}
                    alt={`${project.artist} — ${project.track}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={project.homeCover.src}
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ))}
              <button
                type="button"
                aria-label={`Voir le projet ${project.artist} — ${project.track}`}
                onClick={() => navigate(`/work/${project.slug}`)}
                className="absolute inset-0 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black/85 to-transparent" />

      <div
        ref={captionContainerRef}
        className="absolute inset-x-page bottom-page z-10 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}
      >
        <div ref={captionTrackRef} className="flex">
          {(() => {
            // The whole caption bar follows the ACTIVE project's chosen
            // color — non-active captions are the same color, just dimmed,
            // rather than an unrelated fixed gray.
            const activeColor = loopedProjects[activeAbsoluteIndex]?.homeCaptionColor ?? "white";
            const inactiveClass =
              activeColor === "black"
                ? "text-black/50 hover:text-black/70"
                : "text-white/50 hover:text-white/70";

            return loopedProjects.map((project, i) => {
              const isActive = i === activeAbsoluteIndex;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => shiftBy(i - activeAbsoluteIndex)}
                  disabled={isActive}
                  style={{ width: ITEM_WIDTH }}
                  className={`font-caption leading-caption flex shrink-0 flex-col items-center justify-center px-1 text-center uppercase transition-colors ${
                    isActive ? (activeColor === "black" ? "text-black" : "text-white") : inactiveClass
                  }`}
                >
                  <span className="w-full truncate text-base font-semibold">{project.track}</span>
                  <span className="w-full truncate text-base font-medium">{project.artist}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
}
