import type { Metadata } from "next";
import WorkPage from "@/components/WorkPage";
import { getProjects } from "@/lib/sanity";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Work",
};

export default async function Work() {
  const projects = await getProjects();
  return <WorkPage projects={projects} />;
}
