import { ProjectDetail } from "@/components/project/ProjectDetail";
import ProjectNotFound from "@/components/project/ProjectNotFound";
import {
  getProjectByProjectId,
  getProjectTimelineByProjectId,
} from "@/lib/actions/project";

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const project = await getProjectByProjectId(projectId);

  if (!project) {
    return <ProjectNotFound />;
  }

  const timeline =
    project.status !== "OPEN"
      ? await getProjectTimelineByProjectId(
          projectId,
          project.assignedStudent?.id || null
        )
      : null;

  return <ProjectDetail project={project} timeline={timeline} />;
}
