"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { useHomeAppearance } from "@/components/HomeAppearance";

// Keep in sync with --spacing-page in src/app/globals.css.
export const PAGE_MARGIN = 20;
const LOGO_SIZE = 44;
export const HEADER_HEIGHT = LOGO_SIZE + PAGE_MARGIN * 2;

export default function Header() {
  const pathname = usePathname();
  const { headerColor } = useHomeAppearance();
  const isHomePage = pathname === "/";
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
      <div className="grid w-full grid-cols-3 items-start px-page">
        <nav className="justify-self-start">
          <TransitionLink
            href="/work"
            className={`font-nav text-base font-semibold uppercase tracking-wide transition-colors ${
              isHome ? "text-white/90 hover:text-white" : "text-black/80 hover:text-black"
            }`}
          >
            Work
          </TransitionLink>
        </nav>

        <TransitionLink href="/" className="justify-self-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            priority
            className={isHome ? "invert-0" : "invert"}
          />
        </TransitionLink>

        <nav className="justify-self-end">
          <TransitionLink
            href="/about"
            className={`font-nav text-base font-semibold uppercase tracking-wide transition-colors ${
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
