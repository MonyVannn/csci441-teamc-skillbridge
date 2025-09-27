import { ProjectCategory, ProjectScope } from "@prisma/client";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";

export function Filters() {
  return (
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
        <h3 className="font-medium text-gray-900">Category</h3>
        <div className="space-y-2">
          {Object.keys(ProjectCategory).map((categoryKey) => {
            // Special handling for UI_UX_DESIGN
            let displayText = categoryKey;
            if (categoryKey === "UI_UX_DESIGN") {
              displayText = "UI/UX Design";
            } else {
              // General formatting for other categories
              displayText = categoryKey
                .replace(/_/g, " ") // Replace underscores with spaces
                .toLowerCase() // Convert to lowercase
                .split(" ") // Split into words
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
                .join(" "); // Join words back with spaces
            }

            return (
              <div key={categoryKey} className="flex items-center space-x-2">
                <Checkbox id={categoryKey} />
                <label htmlFor={categoryKey} className="text-sm text-gray-700">
                  {displayText}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Scope</h3>
        <div className="space-y-2">
          {Object.keys(ProjectScope).map((scope) => (
            <div key={scope} className="flex items-center space-x-2">
              <Checkbox id={scope} />
              <label htmlFor={scope} className="text-sm text-gray-700">
                {scope
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </label>
            </div>
          ))}
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
              Less than 2 days
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
    </div>
  );
}
