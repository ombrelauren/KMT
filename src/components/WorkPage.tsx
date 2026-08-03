"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import TransitionLink from "@/components/TransitionLink";
import { FADE_MS, HOLD_MS } from "@/components/PageTransition";
import { useWorkFilter } from "@/components/WorkFilter";

export default function WorkPage({ projects }: { projects: Project[] }) {
  const filter = useWorkFilter();
  // The grid keeps showing the OLD filter's results while the overlay
  // fades in, and only swaps to the new filter once it's fully opaque —
  // same "swap hidden behind full black" trick the page transition uses —
  // otherwise the new grid is already in the DOM from the first frame and
  // shows straight through the overlay while it's still fading in.
  const [displayedFilter, setDisplayedFilter] = useState(filter);
  const [flashing, setFlashing] = useState(false);
  const previousFilterRef = useRef(filter);

  // Depends only on `filter`, not `displayedFilter` — this same effect is
  // what updates displayedFilter, so including it would make the effect
  // re-fire (and cancel its own pending fade-out timeout) the moment the
  // swap happens, leaving the overlay stuck fully opaque.
  useEffect(() => {
    if (previousFilterRef.current === filter) return;
    previousFilterRef.current = filter;
    setFlashing(true);
    const swapTimeout = setTimeout(() => setDisplayedFilter(filter), FADE_MS);
    const fadeOutTimeout = setTimeout(() => setFlashing(false), FADE_MS + HOLD_MS);
    return () => {
      clearTimeout(swapTimeout);
      clearTimeout(fadeOutTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredProjects =
    displayedFilter === "all"
      ? projects
      : projects.filter((project) => project.categories.includes(displayedFilter));

  return (
    <div className="min-h-screen bg-white">
      <div className="relative z-0 grid grid-cols-1 md:grid-cols-3">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 bg-white transition-opacity ${
            flashing ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        />
        {filteredProjects.map((project) => (
          <TransitionLink
            key={project.slug}
            href={`/work/${project.slug}`}
            className="group relative aspect-video overflow-hidden"
          >
            <Image
              src={project.coverImage}
              alt={project.artist ? `${project.artist} — ${project.track}` : project.track}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-hover uppercase text-white">
                {project.track}
              </p>
              {project.artist && (
                <p className="text-hover font-artist uppercase text-white">
                  {project.artist}
                </p>
              )}
              <p className="text-hover uppercase text-white">
                {project.year}
              </p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
