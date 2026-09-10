import type { Metadata } from "next";
import { geist, karrik } from "./fonts";
import Header from "@/components/Header";
import PageTransitionProvider from "@/components/PageTransition";
import HomeAppearanceProvider from "@/components/HomeAppearance";
import WorkFilterProvider from "@/components/WorkFilter";
import { getSiteMeta } from "@/lib/sanity";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${karrik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PageTransitionProvider>
          <HomeAppearanceProvider>
            <WorkFilterProvider>
              <Header />
              {children}
            </WorkFilterProvider>
          </HomeAppearanceProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}
