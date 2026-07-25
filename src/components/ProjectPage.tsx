"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import VideoPlayer from "@/components/VideoPlayer";

const SIXTEEN_BY_NINE = 16 / 9;
const isWidescreen = (ratio: number | undefined) =>
  ratio == null || Math.abs(ratio - SIXTEEN_BY_NINE) < 0.05;

export default function ProjectPage({ project }: { project: Project }) {
  const creditsRef = useRef<HTMLDivElement>(null);
  const [creditsHeight, setCreditsHeight] = useState(0);
  // Video aspect ratio isn't known until the player reads it, keyed by row
  // index so each full-bleed video's layout can switch once it's known.
  const [videoRatios, setVideoRatios] = useState<Record<number, number>>({});

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
          // Full-bleed rows fill the whole screen height when the media is
          // 16:9 (cropping top/bottom is fine there). A non-16:9 full-bleed
          // clip instead renders at its own natural ratio, full width, so
          // nothing gets cropped — if that makes it taller than the screen,
          // scrolling reveals the rest. Side-by-side (50/50) rows always
          // size to a 16:9 ratio, unaffected by any of this.
          const isFullBleed = row.length === 1 && row[0].width === "full";

          if (isFullBleed) {
            const block = row[0];
            const knownRatio = block.type === "image" ? block.aspectRatio : videoRatios[rowIndex];
            const widescreen = isWidescreen(knownRatio);

            if (block.type === "video") {
              return (
                <div key={rowIndex} className={widescreen ? "relative h-screen w-full" : "relative w-full"}>
                  {block.controls ? (
                    <VideoPlayer
                      src={block.src}
                      fit={widescreen ? "cover" : "natural"}
                      onAspectRatio={(ratio) =>
                        setVideoRatios((prev) => ({ ...prev, [rowIndex]: ratio }))
                      }
                    />
                  ) : (
                    <video
                      src={block.src}
                      className={
                        widescreen ? "absolute inset-0 h-full w-full object-cover" : "block h-auto w-full"
                      }
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedMetadata={(e) => {
                        const el = e.currentTarget;
                        if (el.videoWidth && el.videoHeight) {
                          setVideoRatios((prev) => ({ ...prev, [rowIndex]: el.videoWidth / el.videoHeight }));
                        }
                      }}
                    />
                  )}
                </div>
              );
            }

            if (widescreen) {
              return (
                <div key={rowIndex} className="relative h-screen w-full">
                  <Image src={block.src} alt="" fill priority={rowIndex === 0} className="object-cover" />
                </div>
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
                    <Image src={block.src} alt="" fill className="object-cover" />
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
              <div key={i} className="flex gap-8">
                <span className="w-64 shrink-0">{block.label}</span>
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
