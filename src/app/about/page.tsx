import AboutPage from "@/components/AboutPage";
import { getSiteSettings } from "@/lib/sanity";

export const revalidate = 30;

export default async function About() {
  const socialLinks = await getSiteSettings();
  return <AboutPage socialLinks={socialLinks} />;
}
