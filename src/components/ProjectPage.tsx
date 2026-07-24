"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";

export default function ProjectPage({ project }: { project: Project }) {
  const creditsRef = useRef<HTMLDivElement>(null);
  const [creditsHeight, setCreditsHeight] = useState(0);

  useEffect(() => {
    const el = creditsRef.current;
    if (!el) return;

    const updateHeight = () => setCreditsHeight(el.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-black">
      {/* Media stack — sits above the credits panel and scrolls over it. */}
      <div className="relative z-10 bg-black">
        {project.media.map((row, rowIndex) => {
          // Full-bleed rows fill the whole screen height (cropping top/bottom
          // is fine there). Side-by-side (50/50) rows instead size their
          // height to a 16:9 ratio, so the full width of each image stays
          // visible instead of being cropped to fit a too-tall column.
          const isFullBleed = row.length === 1 && row[0].width === "full";

          return (
            <div key={rowIndex} className={`flex w-full ${isFullBleed ? "h-screen" : ""}`}>
              {row.map((block, blockIndex) => (
                <div
                  key={blockIndex}
                  className={`relative ${isFullBleed ? "h-full" : "aspect-video"}`}
                  style={{ width: row.length === 2 || block.width === "half" ? "50%" : "100%" }}
                >
                  {block.type === "video" ? (
                    <video
                      src={block.src}
                      className="absolute inset-0 h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image src={block.src} alt="" fill priority={rowIndex === 0} className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Credits panel — fixed underneath, revealed once the media stack has
          fully scrolled past. The spacer below keeps the page from scrolling
          any further than that. */}
      <div ref={creditsRef} className="fixed inset-x-0 bottom-0 z-0 bg-white px-page py-page">
        <div className="flex gap-8">
          <div className="flex w-64 flex-col gap-1 font-body text-left text-sm font-semibold uppercase tracking-wide text-black">
            {project.credits.map((line) => (
              <p key={line.label}>{line.label}</p>
            ))}
          </div>
          <div className="flex flex-col gap-1 font-body text-left text-sm font-semibold uppercase tracking-wide text-black">
            {project.credits.map((line) => (
              <p key={line.label}>{line.value}</p>
            ))}
          </div>
        </div>

        <p className="font-body mt-3 text-sm font-semibold uppercase tracking-wide text-black">
          {project.creditsNote}
        </p>
      </div>

      <div style={{ height: creditsHeight }} />
    </div>
  );
}
