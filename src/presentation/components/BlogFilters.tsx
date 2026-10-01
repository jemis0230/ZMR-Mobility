"use client";

import { motion } from "framer-motion";
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
      if (searchValue) {
        params.set("q", searchValue);
      } else {
        params.delete("q");
      }
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
    router.push(`/blogs?${params.toString()}`, { scroll: false });
  };

  const allCategories = ["All", ...categories];

  return (
    <div className="space-y-8 mb-12">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
        <div className="relative glass-card border-ink/10 flex items-center px-6 py-4 bg-ink/[0.02]">
          <Search className="w-5 h-5 text-primary mr-4" />
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for articles, technology, or news..." 
            className="bg-transparent flex-1 outline-none text-ink placeholder:text-ink/40 font-medium"
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")} className="text-ink/40 hover:text-ink transition-colors">
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
            onClick={() => handleCategoryChange(cat)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${
              currentCategory === cat
                ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(26,115,232,0.3)]"
                : "bg-ink/5 text-ink/60 border-ink/10 hover:border-ink/15 hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
