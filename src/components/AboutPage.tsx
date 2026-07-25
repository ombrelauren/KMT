import { HEADER_HEIGHT } from "@/components/Header";
import HeaderBackdrop from "@/components/HeaderBackdrop";
import type { AboutContent } from "@/lib/sanity";

export default function AboutPage({ about }: { about: AboutContent }) {
  const paragraphs = about.mainText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ paddingTop: HEADER_HEIGHT }}>
      <HeaderBackdrop />
      {/* The title stays put at its usual spot below the header (same as
          Work). Only the text block underneath (paragraph, contacts,
          socials) centers itself in the remaining space down to the
          bottom of the screen — flex-1 on both this group and the text
          block below make that remaining space stretch responsively. */}
      <div className="flex flex-1 flex-col items-center px-page pt-title-top text-center">
        <h1 className="text-heading uppercase text-black">About</h1>

        {/* mt-[64px]: minimum gap kept between the title and the text block
            below, even on a very short window where centering would
            otherwise push them right next to each other. */}
        <div className="mt-[64px] flex flex-1 flex-col items-center justify-center pb-[100px]">
          {/* Block 1: main text, from Sanity — each line is its own paragraph */}
          <div className="text-body max-w-[730px] uppercase text-black">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className={i > 0 ? "mt-[24px]" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Gap between block 1 and block 2 (contact) — adjust mt-[64px] */}
          <div className="text-body mt-[64px] flex w-full max-w-[730px] justify-between uppercase text-black">
            <div className="text-left">
              <p>{about.leftContact.name}</p>
              <a
                href={`mailto:${about.leftContact.email}`}
                className="transition-colors hover:text-zinc-600"
              >
                {about.leftContact.email}
              </a>
            </div>
            <div className="text-right">
              <p>{about.rightContact.name}</p>
              <a
                href={`mailto:${about.rightContact.email}`}
                className="transition-colors hover:text-zinc-600"
              >
                {about.rightContact.email}
              </a>
            </div>
          </div>

          {/* Gap between block 2 and block 3 (social links) — adjust mt-[64px] */}
          <nav className="text-body mt-[64px] flex w-full max-w-[730px] justify-between uppercase text-black">
            {about.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-zinc-600"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
