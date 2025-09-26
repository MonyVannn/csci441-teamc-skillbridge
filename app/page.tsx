import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { getAvailableProjects } from "@/lib/actions/project";
import { ProjectCard } from "@/components/browse/ProjectCard";
import { EmptyProject } from "@/components/browse/EmptyProject";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const projects = await getAvailableProjects();
  const query = (await searchParams).query;

  console.log("query: ", query);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="container mx-auto flex pb-20">
        {/* Filtering Sidebar */}
        <div className="w-80 border-r border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>

          {/* Service Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Service options</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="online-sellers" />
                <label
                  htmlFor="online-sellers"
                  className="text-sm text-gray-700"
                >
                  Online sellers
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="local-sellers" />
                <label
                  htmlFor="local-sellers"
                  className="text-sm text-gray-700"
                >
                  Local sellers
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="pro-services" />
                <label htmlFor="pro-services" className="text-sm text-gray-700">
                  Pro services
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seller Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Seller details</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="top-rated" />
                <label htmlFor="top-rated" className="text-sm text-gray-700">
                  Top Rated seller
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level-two" />
                <label htmlFor="level-two" className="text-sm text-gray-700">
                  Level 2
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="level-one" />
                <label htmlFor="level-one" className="text-sm text-gray-700">
                  Level 1
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="new-seller" />
                <label htmlFor="new-seller" className="text-sm text-gray-700">
                  New seller
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Budget */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Budget</h3>
            <div className="space-y-4">
              <div className="px-2">
                <Slider
                  defaultValue={[5, 500]}
                  max={1000}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$5</span>
                  <span>$1000+</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">MIN.</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">MAX.</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Time */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Delivery time</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="express-24h" />
                <label htmlFor="express-24h" className="text-sm text-gray-700">
                  Express 24H
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="up-to-3-days" />
                <label htmlFor="up-to-3-days" className="text-sm text-gray-700">
                  Up to 3 days
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="up-to-7-days" />
                <label htmlFor="up-to-7-days" className="text-sm text-gray-700">
                  Up to 7 days
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="anytime" />
                <label htmlFor="anytime" className="text-sm text-gray-700">
                  Anytime
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Video Type */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Video type</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="youtube" />
                <label htmlFor="youtube" className="text-sm text-gray-700">
                  YouTube videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="social-media" />
                <label htmlFor="social-media" className="text-sm text-gray-700">
                  Social media videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="wedding" />
                <label htmlFor="wedding" className="text-sm text-gray-700">
                  Wedding videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="commercial" />
                <label htmlFor="commercial" className="text-sm text-gray-700">
                  Commercial videos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="music-videos" />
                <label htmlFor="music-videos" className="text-sm text-gray-700">
                  Music videos
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Software */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Software</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="premiere-pro" />
                <label htmlFor="premiere-pro" className="text-sm text-gray-700">
                  Adobe Premiere Pro
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="after-effects" />
                <label
                  htmlFor="after-effects"
                  className="text-sm text-gray-700"
                >
                  Adobe After Effects
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="final-cut" />
                <label htmlFor="final-cut" className="text-sm text-gray-700">
                  Final Cut Pro
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="davinci" />
                <label htmlFor="davinci" className="text-sm text-gray-700">
                  DaVinci Resolve
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        {projects.length <= 0 ? (
          <EmptyProject />
        ) : (
          <ProjectCard projects={projects} />
        )}
      </div>
    </div>
  );
}
