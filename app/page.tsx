import { getAvailableProjects } from "@/lib/actions/project";
import { ProjectCard } from "@/components/browse/ProjectCard";
import { EmptyProject } from "@/components/browse/EmptyProject";
import { Filters } from "@/components/browse/Filters";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = ((await searchParams).query as string) || "";
  const page = ((await searchParams).page as string) || "";
  const categories = ((await searchParams).categories as string) || "";
  const scopes = ((await searchParams).scopes as string) || "";
  const minBudget = ((await searchParams).minBudget as string) || "";
  const maxBudget = ((await searchParams).maxBudget as string) || "";

  const { availableProjects, totalProjects } = await getAvailableProjects(
    query,
    page,
    categories,
    scopes,
    minBudget,
    maxBudget
  );
  const totalPages = Math.ceil(totalProjects / 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="container mx-auto flex pb-20">
        {/* Filtering Sidebar */}
        <Filters />

        {/* Projects */}
        {availableProjects.length <= 0 ? (
          <EmptyProject />
        ) : (
          <ProjectCard
            projects={availableProjects.map(({ applications, ...project }) => ({
              ...project,
              applications: [],
            }))}
            currentPageProp={Number(page) === 0 ? 1 : Number(page)}
            totalPagesProp={totalPages}
          />
        )}
      </div>
    </div>
  );
}
