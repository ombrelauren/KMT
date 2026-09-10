import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { getAboutContent } from "@/lib/sanity";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "About",
};

export default async function About() {
  const about = await getAboutContent();
  return <AboutPage about={about} />;
}
