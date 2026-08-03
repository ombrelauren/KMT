"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { useHomeAppearance } from "@/components/HomeAppearance";
import { useSetWorkFilter, useWorkFilter, type WorkFilterValue } from "@/components/WorkFilter";
import type { ProjectCategory } from "@/data/projects";

// Keep in sync with --spacing-page in src/app/globals.css.
export const PAGE_MARGIN = 20;
const LOGO_SIZE = 44;
export const HEADER_HEIGHT = LOGO_SIZE + PAGE_MARGIN * 2;

const FILTERS: { label: string; value: WorkFilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Music Videos", value: "music-video" satisfies ProjectCategory },
  { label: "Film", value: "film" satisfies ProjectCategory },
  { label: "Commercials", value: "commercial" satisfies ProjectCategory },
  { label: "Photography", value: "photography" satisfies ProjectCategory },
];

export default function Header() {
  const pathname = usePathname();
  const { headerColor } = useHomeAppearance();
  const filter = useWorkFilter();
  const setFilter = useSetWorkFilter();
  const isHomePage = pathname === "/";
  const isWorkPage = pathname === "/work";
  const isProjectPage = /^\/work\/[^/]+$/.test(pathname ?? "");
  // Home and individual project pages show media edge-to-edge behind the
  // header, so they need light/dark text rather than the plain dark text
  // used everywhere else (which has a solid white page background). On the
  // home page specifically, each project can choose white or black text to
  // match its own cover video.
  const isHome = isProjectPage || (isHomePage ? headerColor === "white" : false);

  return (
    // Always transparent — on Work/About the white page background behind
    // it already does the job, so painting our own white fill here just
    // causes a premature white flash during page transitions.
    <header className="fixed inset-x-0 top-0 z-30 flex w-full items-start py-page bg-transparent">
      <div className="relative flex w-full items-start justify-between px-page">
        {/* -mt-[10px]: the logo mark sits low within its own 44px box, so
            nudge just the logo up to line up with the text baseline next
            to it, instead of pushing the text down to match the logo. */}
        <TransitionLink href="/" className="-mt-[10px]">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            priority
            className={isHome ? "invert-0" : "invert"}
          />
        </TransitionLink>

        {isWorkPage && (
          <nav className="absolute left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-[16px] gap-y-[8px] md:gap-x-[32px]">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`text-filter whitespace-nowrap uppercase transition-colors ${
                  filter === item.value ? "text-black" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <nav className="flex items-center gap-x-[32px]">
          <TransitionLink
            href="/work"
            className={`text-nav uppercase transition-colors ${
              isHome ? "text-white/90 hover:text-white" : "text-black/80 hover:text-black"
            }`}
          >
            Work
          </TransitionLink>
          <TransitionLink
            href="/about"
            className={`text-nav uppercase transition-colors ${
              isHome ? "text-white/90 hover:text-white" : "text-black/80 hover:text-black"
            }`}
          >
            About
          </TransitionLink>
        </nav>
      </div>
    </header>
  );
}
