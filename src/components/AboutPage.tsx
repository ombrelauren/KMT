import { HEADER_HEIGHT } from "@/components/Header";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Vimeo", href: "#" },
  { label: "Youtube", href: "#" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ paddingTop: HEADER_HEIGHT }}>
      {/* This whole group (title + the 3 text blocks below) sizes to its own
          content and stays put — it never stretches. Any leftover height on
          tall screens simply shows up as empty space below it, at the
          bottom of the page. */}
      <div className="flex flex-col items-center px-page pt-title-top text-center">
        <h1 className="font-heading text-9xl font-semibold uppercase leading-[1] tracking-tight text-black">
          About
        </h1>

        {/* Block 1: description + tagline + "Jad & Tarek" */}
        <div className="font-body mt-24 max-w-[730px] text-base font-semibold uppercase leading-[1.2] tracking-wide text-black">
          <p>
            We work across music videos, films, and photography, producing projects throughout
            Europe and the SWANA region. Combining a hands-on approach with a trusted network of
            collaborators, we build teams around each project to ensure every production receives
            the attention it deserves.
          </p>

          <p className="mt-6">We&apos;ll keep the conversation going, even if you Kutmytongue</p>

          <p className="mt-6">Jad &amp; Tarek</p>
        </div>

        {/* Gap between block 1 and block 2 (contact) — adjust mt-16 */}
        <div className="font-body mt-16 flex w-full max-w-[730px] justify-between text-base font-semibold uppercase tracking-wide text-black">
          <div className="text-left">
            <p>Jad Daccache</p>
            <p className="font-body font-normal text-zinc-600">jad@kmtproduction.com</p>
          </div>
          <div className="text-right">
            <p>Tarek Daccache</p>
            <p className="font-body font-normal text-zinc-600">tarek@kmtproduction.com</p>
          </div>
        </div>

        {/* Gap between block 2 and block 3 (social links) — adjust mt-16 */}
        <nav className="font-nav mt-16 flex w-full max-w-[730px] justify-between text-base font-semibold uppercase tracking-wide text-black">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-zinc-600">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
