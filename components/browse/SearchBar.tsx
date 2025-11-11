"use client";

import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { searchProjectsQuick } from "@/lib/actions/project";
import { getCategoryThumbnail } from "@/lib/categoryThumbnails";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  category: string;
  scope: string;
  budget: number;
  createdAt: Date;
  businessOwner: {
    id: string;
    imageUrl: string | null;
    firstName: string | null;
    lastName: string | null;
    address: string | null;
  };
};

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHomePage = pathname === "/";

  // Debounce the URL update for home page
  useEffect(() => {
    if (!isHomePage) return;

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("query", query);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [query, isHomePage, router, searchParams, pathname]);

  // Fetch search results for non-home pages
  useEffect(() => {
    if (isHomePage || !query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProjectsQuick(query);
        setSearchResults(results.projects as SearchResult[]);
        setHasMore(results.hasMore);
        setTotal(results.total);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isHomePage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setQuery(value);
  };

  const handleSeeAllResults = () => {
    setShowDropdown(false);
    router.push(`/?query=${encodeURIComponent(query)}`);
  };

  const handleResultClick = () => {
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      {isSearching && (
        <div className="absolute top-1/2 -translate-y-1/2 right-5 flex items-center gap-2">
          <p className="text-gray-400 text-xs md:text-sm">Searching...</p>
        </div>
      )}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search projects"
        className="pl-8 border-gray-300 text-sm md:text-base"
        value={query}
        onChange={handleSearchChange}
        onFocus={() => {
          if (!isHomePage && searchResults.length > 0) {
            setShowDropdown(true);
          }
        }}
      />

      {/* Search Dropdown - Only show on non-home pages */}
      {!isHomePage && showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[500px] overflow-y-auto"
        >
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="divide-y divide-gray-100">
                {searchResults.map((project) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    onClick={handleResultClick}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={getCategoryThumbnail(project.category)}
                        alt={project.category}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>
                          {project.businessOwner.firstName}{" "}
                          {project.businessOwner.lastName}
                        </span>
                        <span>•</span>
                        <span>${project.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {hasMore && (
                <Button
                  variant={"ghost"}
                  onClick={handleSeeAllResults}
                  className="w-full text-center py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
                >
                  See all {total} results
                </Button>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">
                No projects found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
