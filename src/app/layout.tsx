import type { Metadata } from "next";
import { inter } from "./fonts";
import Header from "@/components/Header";
import PageTransitionProvider from "@/components/PageTransition";
import HomeAppearanceProvider from "@/components/HomeAppearance";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KMT",
    template: "%s — KMT",
  },
  description:
    "KMT is a production studio working across music videos, films, and photography, producing projects throughout Europe and the SWANA region.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PageTransitionProvider>
          <HomeAppearanceProvider>
            <Header />
            {children}
          </HomeAppearanceProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}
