import AboutPage from "@/components/AboutPage";
import { getAboutContent } from "@/lib/sanity";

export const revalidate = 30;

export default async function About() {
  const about = await getAboutContent();
  return <AboutPage about={about} />;
}
