"use client";

import Image from "next/image";
import { useState } from "react";
import type { Project, ProjectCategory } from "@/data/projects";
import { HEADER_HEIGHT } from "@/components/Header";
import HeaderBackdrop from "@/components/HeaderBackdrop";
import TransitionLink from "@/components/TransitionLink";

const FILTERS: { label: string; value: "all" | ProjectCategory }[] = [
  { label: "All", value: "all" },
  { label: "Music Videos", value: "music-video" },
  { label: "Film", value: "film" },
  { label: "Commercials", value: "commercial" },
  { label: "Photography", value: "photography" },
];

export default function WorkPage({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<"all" | ProjectCategory>("all");

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.categories.includes(filter));

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: HEADER_HEIGHT }}>
      <HeaderBackdrop />
      <div
        className="sticky z-20 flex w-full flex-col items-center bg-white pb-8 pt-title-top"
        style={{ top: HEADER_HEIGHT }}
      >
        <h1 className="font-heading text-9xl font-semibold uppercase leading-heading tracking-tight text-black">
          Work
        </h1>

        <nav className="mt-0 flex items-center justify-center gap-x-8">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`font-filter whitespace-nowrap text-xs font-semibold uppercase tracking-wide transition-colors ${
                filter === item.value ? "text-black" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative z-0 grid grid-cols-2">
        {filteredProjects.map((project) => (
          <TransitionLink
            key={project.slug}
            href={`/work/${project.slug}`}
            className="group relative aspect-video overflow-hidden"
          >
            <Image
              src={project.coverImage}
              alt={`${project.artist} — ${project.track}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="font-body leading-caption text-base font-semibold uppercase tracking-wide text-white">
                {project.track}
              </p>
              <p className="font-body leading-caption text-base font-semibold uppercase tracking-wide text-white">
                {project.artist}
              </p>
              <p className="font-body leading-caption text-base font-semibold uppercase tracking-wide text-white">
                {project.year}
              </p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
