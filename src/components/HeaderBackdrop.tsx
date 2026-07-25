import { HEADER_HEIGHT } from "@/components/Header";

// Blocks the header's screen area on white-background pages so scrolled
// content doesn't show through it (the header itself stays fully
// transparent — see Header.tsx — so this lives on the page instead: it
// mounts/unmounts together with the rest of the page's content, never on
// its own, so it can't flash in early during a page transition).
export default function HeaderBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[15] bg-white"
      style={{ height: HEADER_HEIGHT }}
    />
  );
}
