"use client";

import { ProjectCategory, ProjectScope } from "@prisma/client";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filter states from URL
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categories = searchParams.get("categories");
    return categories ? categories.split(",") : [];
  });

  const [selectedScopes, setSelectedScopes] = useState<string[]>(() => {
    const scopes = searchParams.get("scopes");
    return scopes ? scopes.split(",") : [];
  });

  const [budgetRange, setBudgetRange] = useState<[number, number]>(() => {
    const min = searchParams.get("minBudget");
    const max = searchParams.get("maxBudget");
    return [min ? parseInt(min, 10) : 5, max ? parseInt(max, 10) : 1000];
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    } else {
      params.delete("categories");
    }

    if (selectedScopes.length > 0) {
      params.set("scopes", selectedScopes.join(","));
    } else {
      params.delete("scopes");
    }

    if (budgetRange[0] > 5) {
      params.set("minBudget", budgetRange[0].toString());
    } else {
      params.delete("minBudget");
    }

    if (budgetRange[1] < 1000) {
      params.set("maxBudget", budgetRange[1].toString());
    } else {
      params.delete("maxBudget");
    }

    // Reset page to 1 if filters have changed
    if (params.toString() !== searchParams.toString()) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    selectedCategories,
    selectedScopes,
    budgetRange,
    pathname,
    router,
    searchParams,
  ]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== category)
      );
    }
  };

  const handleScopeChange = (scope: string, checked: boolean) => {
    if (checked) {
      setSelectedScopes([...selectedScopes, scope]);
    } else {
      setSelectedScopes(selectedScopes.filter((item) => item !== scope));
    }
  };

  const handleBudgetChange = (values: [number, number]) => {
    setBudgetRange(values);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedScopes([]);
    setBudgetRange([5, 1000]);
  };

  return (
    <div className="w-80 border-r border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
          onClick={clearAllFilters}
        >
          Clear all
        </Button>
      </div>

      {/* Category Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Category</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Object.keys(ProjectCategory).map((categoryKey) => {
            const displayText = categoryKey
              .replace(/_/g, " ")
              .replace(
                /\w\S*/g,
                (txt) =>
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
              )
              .replace("Ui Ux Design", "UI/UX Design");

            return (
              <div key={categoryKey} className="flex items-center space-x-2">
                <Checkbox
                  id={categoryKey}
                  checked={selectedCategories.includes(categoryKey)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(categoryKey, !!checked)
                  }
                />
                <label htmlFor={categoryKey} className="text-sm text-gray-700">
                  {displayText}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Scope Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Scope</h3>
        <div className="space-y-2">
          {Object.keys(ProjectScope).map((scope) => {
            const displayText = scope
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            return (
              <div key={scope} className="flex items-center space-x-2">
                <Checkbox
                  id={scope}
                  checked={selectedScopes.includes(scope)}
                  onCheckedChange={(checked) =>
                    handleScopeChange(scope, !!checked)
                  }
                />
                <label htmlFor={scope} className="text-sm text-gray-700">
                  {displayText}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Budget Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Budget</h3>
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={budgetRange}
              onValueChange={handleBudgetChange}
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
                value={budgetRange[0]}
                onChange={(e) =>
                  setBudgetRange([
                    parseInt(e.target.value) || 5,
                    budgetRange[1],
                  ])
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">MAX.</label>
              <input
                type="number"
                value={budgetRange[1]}
                onChange={(e) =>
                  setBudgetRange([
                    budgetRange[0],
                    parseInt(e.target.value) || 1000,
                  ])
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
