import { getAvailableProjects } from "@/lib/actions/project";
import { ProjectCard } from "@/components/browse/ProjectCard";
import { EmptyProject } from "@/components/browse/EmptyProject";
import { Filters } from "@/components/browse/Filters";
import { MobileFilters } from "@/components/browse/MobileFilters";
import { getUserOrNull } from "@/lib/actions/user";

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
  const user = await getUserOrNull();

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Floating Filter Button */}
      <MobileFilters />

      {/* Main Content Area */}
      <div className="container mx-auto flex pb-20">
        {/* Filtering Sidebar - Hidden on mobile/tablet, shown on desktop */}
        <div className="hidden lg:block">
          <Filters />
        </div>

        {/* Projects - Full width on mobile, adjusted on desktop */}
        <div className="w-full lg:flex-1">
          {availableProjects.length <= 0 ? (
            <EmptyProject />
          ) : (
            <ProjectCard
              projects={availableProjects.map(
                ({ applications, ...project }) => ({
                  ...project,
                  applications: [],
                })
              )}
              user={user}
              currentPageProp={Number(page) === 0 ? 1 : Number(page)}
              totalPagesProp={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}
