import type { Metadata } from "next";
import { geist, karrik } from "./fonts";
import { getSiteMeta } from "@/lib/sanity";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteMeta();
  return {
    title: {
      default: site.title,
      template: `%s — ${site.title}`,
    },
    description:
      "KMT is a production studio working across music videos, films, and photography, producing projects throughout Europe and the SWANA region.",
    icons: site.faviconUrl ? { icon: site.faviconUrl } : undefined,
  };
}

// Bare on purpose — this wraps BOTH the public site (see (site)/layout.tsx
// for its header/providers/Tailwind) and the embedded Sanity Studio at
// /studio, which needs a clean slate rather than the site's own CSS reset
// and chrome bleeding into its UI.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${karrik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
