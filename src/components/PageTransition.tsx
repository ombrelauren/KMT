"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const FADE_MS = 400;

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
    const timeout = setTimeout(() => setFading(false), 100);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-20 bg-black transition-opacity"
        style={{ opacity: fading ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      />
    </TransitionContext.Provider>
  );
}
