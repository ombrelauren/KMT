"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Exported so other fades (e.g. the Work page's filter-change flash) can
// match this same speed instead of drifting out of sync with their own
// hardcoded duration.
export const FADE_MS = 400;
// How long to sit at fully opaque before fading back — just enough for the
// content swap underneath to happen unseen, not a deliberate dead pause.
export const HOLD_MS = 40;

const TransitionContext = createContext<(href: string) => void>(() => {});

export function useTransitionNavigate() {
  return useContext(TransitionContext);
}

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [fading, setFading] = useState(false);
  const pendingHref = useRef<string | null>(null);

  const navigate = (href: string) => {
    if (href === pathname || pendingHref.current) return;
    pendingHref.current = href;
    setFading(true);
  };

  // Once the overlay is fully black, actually change page.
  useEffect(() => {
    if (!fading || !pendingHref.current) return;
    const timeout = setTimeout(() => {
      router.push(pendingHref.current!);
    }, FADE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fading]);

  // Once the new page has mounted behind the black overlay, fade back in.
  useEffect(() => {
    if (!fading) return;
    pendingHref.current = null;
    const timeout = setTimeout(() => setFading(false), HOLD_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div
        aria-hidden
        // Above the header (z-30) on purpose — the header now sometimes
        // carries page-specific content (the Work page filters), which
        // must disappear during the fade like everything else instead of
        // floating on top of it.
        className="pointer-events-none fixed inset-0 z-40 bg-black transition-opacity"
        style={{ opacity: fading ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      />
    </TransitionContext.Provider>
  );
}
