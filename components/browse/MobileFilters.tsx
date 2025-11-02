"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Filters } from "./Filters";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "./SearchBar";

export function MobileFilters() {
  const searchParams = useSearchParams();

  // Count active filters
  const categories = searchParams.get("categories") || "";
  const scopes = searchParams.get("scopes") || "";
  const minBudget = searchParams.get("minBudget") || "";
  const maxBudget = searchParams.get("maxBudget") || "";

  const categoryCount = categories ? categories.split(",").length : 0;
  const scopeCount = scopes ? scopes.split(",").length : 0;
  const budgetActive = minBudget || maxBudget ? 1 : 0;

  const totalActiveFilters = categoryCount + scopeCount + budgetActive;

  return (
    <Sheet>
      <SheetTrigger asChild suppressHydrationWarning>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 lg:hidden z-40 shadow-lg rounded-full w-14 h-14 p-0"
        >
          <div className="relative">
            <Filter className="h-5 w-5" />
            {totalActiveFilters > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#695DCC] text-white rounded-full text-xs flex items-center justify-center font-semibold">
                {totalActiveFilters}
              </div>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
        <SheetTitle className="p-4 mt-8">
          <SearchBar />
        </SheetTitle>
        <Filters />
      </SheetContent>
    </Sheet>
  );
}
