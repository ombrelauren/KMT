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
      {/* This whole group (title + the 3 text blocks below) sizes to its own
          content and stays put — it never stretches. Any leftover height on
          tall screens simply shows up as empty space below it, at the
          bottom of the page. */}
      <div className="flex flex-col items-center px-page pt-title-top text-center">
        <h1 className="text-heading uppercase text-black">About</h1>

        {/* Block 1: main text, from Sanity — each line is its own paragraph */}
        <div className="text-body mt-24 max-w-[730px] uppercase text-black">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className={i > 0 ? "mt-6" : undefined}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Gap between block 1 and block 2 (contact) — adjust mt-16 */}
        <div className="text-body mt-16 flex w-full max-w-[730px] justify-between uppercase text-black">
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

        {/* Gap between block 2 and block 3 (social links) — adjust mt-16 */}
        <nav className="text-body mt-16 flex w-full max-w-[730px] justify-between uppercase text-black">
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
  );
}
