import { ProjectDetail } from "@/components/project/ProjectDetail";
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
  const timeline =
    project.status !== "OPEN"
      ? await getProjectTimelineByProjectId(
          projectId,
          project.assignedStudent?.id || null
        )
      : null;

  return <ProjectDetail project={project} timeline={timeline} />;
}
