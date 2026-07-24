import ProjectShowcase from "@/components/ProjectShowcase";
import { getProjects } from "@/lib/sanity";

export const revalidate = 30;

export default async function Home() {
  const projects = await getProjects();
  return <ProjectShowcase projects={projects} />;
}
