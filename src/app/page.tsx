import ProjectShowcase from "@/components/ProjectShowcase";
import { projects } from "@/data/projects";

export default function Home() {
  return <ProjectShowcase projects={projects} />;
}
