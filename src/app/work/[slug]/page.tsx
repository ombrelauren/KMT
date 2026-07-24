import { notFound } from "next/navigation";
import ProjectPage from "@/components/ProjectPage";
import { getProject } from "@/lib/sanity";

export const revalidate = 30;

export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return <ProjectPage project={project} />;
}
