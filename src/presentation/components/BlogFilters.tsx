"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function BlogFilters({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("q") || "";
  
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if ((params.get("q") ?? "") === searchValue) return; // no change → don't navigate
      if (searchValue) {
        params.set("q", searchValue);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/blogs?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    params.delete("page");
    router.push(`/blogs?${params.toString()}`, { scroll: false });
  };

  const allCategories = ["All", ...categories];

  return (
    <div className="space-y-8 mb-12">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative rounded-2xl bg-white border border-ink/15 flex items-center px-6 py-4 shadow-card">
          <Search className="w-5 h-5 text-leaf mr-4" aria-hidden />
          <input 
            type="search"
            aria-label="Search articles"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for articles, technology, or news..." 
            className="bg-transparent flex-1 outline-none text-ink placeholder:text-ink/55 font-medium"
          />
          {searchValue && (
            <button type="button" aria-label="Clear search" onClick={() => setSearchValue("")} className="text-ink/60 hover:text-ink transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={currentCategory === cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${
              currentCategory === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-forest border-ink/15 hover:border-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
