import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
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
  const { availableProjects, totalProjects } = await getAvailableProjects(
    query,
    page
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
            projects={availableProjects}
            currentPageProp={Number(page) === 0 ? 1 : Number(page)}
            totalPagesProp={totalPages}
          />
        )}
      </div>
    </div>
  );
}
