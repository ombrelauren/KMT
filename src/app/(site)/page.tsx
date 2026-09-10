import ProjectShowcase from "@/components/ProjectShowcase";
import { getHomeProjects } from "@/lib/sanity";

export const revalidate = 30;

export default async function Home() {
  const projects = await getHomeProjects();
  return <ProjectShowcase projects={projects} />;
}
