"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { useTransitionNavigate } from "@/components/PageTransition";
import { useSetHomeAppearance } from "@/components/HomeAppearance";

// How many slides on either side of the active one keep their video loaded.
// Everything outside this window renders no <video> at all, so we're never
// trying to autoplay every single copy of every project at once. Kept small
// since each loaded video streams/decodes continuously even while hidden —
// a caption click far outside this window was never preloaded either way,
// so it always has to start loading fresh on click regardless of this value.
const LOAD_RADIUS = 1;

const REPEAT = 9;
const MIDDLE_COPY = Math.floor(REPEAT / 2);
const ITEM_WIDTH = 250;

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
  // While a caption-click jump is animating, the scroll handler's own index
  // tracking is suppressed (see jumpToCaption) so the background doesn't
  // crossfade through every slide the scroll passes on its way there.
  const suppressScrollTrackingRef = useRef(false);
  // Kept mounted (fading out) alongside the new active slide for the
  // duration of the crossfade, even if it falls outside LOAD_RADIUS after a
  // long jump — otherwise it would just vanish instead of fading.
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const previousIndexTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = projects.length;

  // Recomputing this 9x-repeated array on every render (e.g. on every scroll
  // frame that updates activeAbsoluteIndex) would rebuild and re-map a large
  // array for no reason, since `projects` itself essentially never changes.
  const loopedProjects = useMemo(
    () => Array.from({ length: REPEAT }, () => projects).flat(),
    [projects],
  );

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

  const animateScrollTo = (targetLeft: number, duration = 500, onComplete?: () => void) => {
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
        onComplete?.();
      }
    };
    scrollAnimationRef.current = requestAnimationFrame(step);
  };

  const shiftBy = (offset: number, onComplete?: () => void) => {
    const track = trackRef.current;
    if (!track) return;
    animateScrollTo(track.scrollLeft + offset * track.clientWidth, undefined, onComplete);
  };

  // Caption clicks can jump many slides away — rather than crossfading
  // through every slide the animated scroll passes on the way there, jump
  // the active index (and thus the background crossfade) straight to the
  // target, and keep the slide we're leaving mounted just long enough to
  // fade out instead of popping out once it falls outside LOAD_RADIUS.
  const jumpToCaption = (i: number) => {
    if (i === activeAbsoluteIndex) return;
    setPreviousIndex(activeAbsoluteIndex);
    setActiveAbsoluteIndex(i);
    lastRoundedRef.current = i;
    suppressScrollTrackingRef.current = true;
    shiftBy(i - activeAbsoluteIndex, () => {
      suppressScrollTrackingRef.current = false;
    });
    if (previousIndexTimeoutRef.current) clearTimeout(previousIndexTimeoutRef.current);
    previousIndexTimeoutRef.current = setTimeout(() => setPreviousIndex(null), 750);
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

      if (!suppressScrollTrackingRef.current) {
        const rounded = Math.round(progress);
        if (rounded !== lastRoundedRef.current) {
          lastRoundedRef.current = rounded;
          setActiveAbsoluteIndex(rounded);
        }
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
      if (previousIndexTimeoutRef.current) clearTimeout(previousIndexTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    // 100dvh (not 100vh) tracks the ACTUAL currently-visible viewport height
    // on mobile, shrinking live when the browser's address/toolbar chrome is
    // showing — so the caption (pinned to bottom-page below) always keeps
    // its margin from whatever is really visible at the bottom of the
    // screen, instead of sitting past it under a hidden-until-scroll bar.
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Background crossfades between projects instead of sliding — each
          loaded cover sits stacked in the same spot, fading in/out based on
          which one is active. */}
      <div className="absolute inset-0">
        {loopedProjects.map((project, i) => {
          const inLoadRange = Math.abs(i - activeAbsoluteIndex) <= LOAD_RADIUS || i === previousIndex;
          if (!inLoadRange) return null;
          const isActive = i === activeAbsoluteIndex;

          return (
            <div
              key={`${project.slug}-${i}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              {project.homeCover.type === "image" ? (
                <Image
                  src={project.homeCover.src}
                  alt={project.artist ? `${project.artist} — ${project.track}` : project.track}
                  fill
                  sizes="100vw"
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
              )}
            </div>
          );
        })}
      </div>

      {/* Invisible scroll track — still drives wheel/snap navigation and the
          click-to-navigate hit areas, just no longer shows the slides. */}
      <div
        ref={trackRef}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loopedProjects.map((project, i) => (
          <div
            key={`${project.slug}-${i}`}
            className="relative h-full w-full flex-shrink-0 snap-center snap-always"
          >
            <button
              type="button"
              aria-label={`Voir le projet ${project.artist ? `${project.artist} — ` : ""}${project.track}`}
              onClick={() => navigate(`/work/${project.slug}`)}
              className="absolute inset-0 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Narrowed to exactly one caption's width and centered, instead of
          spanning the page — so only the active project's title/artist is
          ever visible. Neighbors still slide through this window during a
          transition (the same translateX track as before); the gradient
          mask fades them out softly at the window's own edges rather than
          hard-clipping mid-word, and does so regardless of how wide any
          given title/artist pair happens to be, since it fades the window
          itself, not the text. Always white, regardless of the project's
          homeCaptionColor (only the header still uses that). */}
      <div
        ref={captionContainerRef}
        className="absolute bottom-page left-1/2 z-10 -translate-x-1/2 overflow-hidden"
        style={{
          width: ITEM_WIDTH,
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div ref={captionTrackRef} className="flex">
          {loopedProjects.map((project, i) => {
            const isActive = i === activeAbsoluteIndex;

            return (
              <button
                key={i}
                type="button"
                onClick={() => jumpToCaption(i)}
                disabled={isActive}
                style={{ width: ITEM_WIDTH }}
                className={`text-caption flex shrink-0 flex-col items-center justify-center px-[4px] text-center uppercase transition-colors ${
                  isActive ? "text-white" : "cursor-pointer text-white/50 hover:text-white/70"
                }`}
              >
                <span className="w-full truncate font-semibold">{project.track}</span>
                {project.artist && (
                  <span className="font-artist w-full truncate">{project.artist}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
