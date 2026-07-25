"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import VideoPlayer from "@/components/VideoPlayer";

const SIXTEEN_BY_NINE = 16 / 9;

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
          // Full-bleed rows always render at the media's real aspect ratio,
          // full width, never cropped — if that makes it taller than the
          // screen, scrolling reveals the rest. Side-by-side (50/50) rows
          // still size to a fixed 16:9 slot so a pair lines up cleanly.
          const isFullBleed = row.length === 1 && row[0].width === "full";

          if (isFullBleed) {
            const block = row[0];

            if (block.type === "video") {
              return block.controls ? (
                <VideoPlayer key={rowIndex} src={block.src} fit="natural" />
              ) : (
                <video
                  key={rowIndex}
                  src={block.src}
                  className="block h-auto w-full bg-black"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              );
            }

            const ratio = block.aspectRatio ?? SIXTEEN_BY_NINE;
            return (
              <Image
                key={rowIndex}
                src={block.src}
                alt=""
                width={1600}
                height={Math.round(1600 / ratio)}
                sizes="100vw"
                priority={rowIndex === 0}
                className="block h-auto w-full"
              />
            );
          }

          return (
            <div key={rowIndex} className="flex w-full">
              {row.map((block, blockIndex) => (
                <div
                  key={blockIndex}
                  className="relative aspect-video"
                  style={{ width: row.length === 2 || block.width === "half" ? "50%" : "100%" }}
                >
                  {block.type === "video" ? (
                    block.controls ? (
                      <VideoPlayer src={block.src} fit="cover" />
                    ) : (
                      <video
                        src={block.src}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    )
                  ) : (
                    <Image
                    src={block.src}
                    alt=""
                    fill
                    sizes={row.length === 2 || block.width === "half" ? "50vw" : "100vw"}
                    className="object-cover"
                  />
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
        {/* No gap/margin between rows on purpose — the line-height below is
            the only spacing, so it matches a normal line break exactly. */}
        <div className="text-credits text-left uppercase text-black">
          {project.description.map((block, i) => {
            if (block.type === "spacer") return <p key={i}>&nbsp;</p>;
            if (block.type === "note") {
              return (
                <p key={i} className="whitespace-pre-line">
                  {block.text}
                </p>
              );
            }
            return (
              <div key={i} className="flex gap-[32px]">
                <span className="w-[256px] shrink-0">{block.label}</span>
                <span>{block.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: creditsHeight }} />
    </div>
  );
}
