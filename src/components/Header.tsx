"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { useTransitionNavigate } from "@/components/PageTransition";
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
  const navigate = useTransitionNavigate();
  const { headerColor } = useHomeAppearance();
  const filter = useWorkFilter();
  const setFilter = useSetWorkFilter();
  const isHomePage = pathname === "/";
  const isWorkPage = pathname === "/work";
  const isProjectPage = /^\/work\/[^/]+$/.test(pathname ?? "");
  // Home and individual project pages show media edge-to-edge behind the
  // header, so they need light/dark text rather than the plain dark text
  // used everywhere else (which has a solid white page background). The
  // Work page always gets the light treatment too (its own background is
  // solid black — see WorkPage.tsx). On the home page specifically, each
  // project can choose white or black text to match its own cover video.
  const showWhiteHeader =
    isProjectPage || isWorkPage || (isHomePage ? headerColor === "white" : false);
  const navLinkClass = `text-nav uppercase transition-colors ${
    showWhiteHeader ? "text-white/90 hover:text-white" : "text-black/80 hover:text-black"
  }`;

  return (
    // Always transparent — on About the white page background behind it
    // already does the job, and on Work the page itself paints its own
    // black background — so painting our own fill here would just cause a
    // premature flash during page transitions.
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
            className={showWhiteHeader ? "invert-0" : "invert"}
          />
        </TransitionLink>

        <nav className="flex items-center gap-x-[32px]">
          {/* Work no longer shows its filters as a permanent row — clicking
              the link still just goes to /work, but hovering it (desktop
              only; there's no hover on touch) now reveals them in a
              dropdown instead, so they don't compete for attention outside
              the Work page and don't need their own row in the header. */}
          <div className="group relative">
            <TransitionLink href="/work" className={navLinkClass}>
              Work
            </TransitionLink>
            {/* pt (not mt) on the wrapper keeps the gap to the dropdown part
                of its own hoverable box, so moving the cursor straight down
                from "Work" into the panel below never crosses a dead zone
                that would drop group-hover along the way. */}
            <div className="absolute right-0 top-full pt-[16px] opacity-0 transition-opacity duration-150 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              <div className="flex flex-col items-end gap-y-[8px] whitespace-nowrap py-[12px]">
                {FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setFilter(item.value);
                      navigate("/work");
                    }}
                    className="text-filter cursor-pointer uppercase text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <TransitionLink href="/about" className={navLinkClass}>
            About
          </TransitionLink>
        </nav>
      </div>
    </header>
  );
}
