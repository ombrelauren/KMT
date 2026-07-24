import { notFound } from "next/navigation";
import ProjectPage from "@/components/ProjectPage";
import { projects } from "@/data/projects";

export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return <ProjectPage project={project} />;
}
