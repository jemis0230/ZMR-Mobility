"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: URLSearchParams;
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={createPageUrl(Math.max(1, currentPage - 1))}
        className={`p-2 rounded-xl border border-ink/10 flex items-center justify-center transition-colors ${
          currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-ink/10 hover:border-ink/25 bg-ink/5"
        }`}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-5 h-5 text-ink" />
      </Link>

      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={createPageUrl(page)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                isActive 
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.4)]" 
                  : "text-ink/65 hover:bg-ink/10 hover:text-ink"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <Link
        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
        className={`p-2 rounded-xl border border-ink/10 flex items-center justify-center transition-colors ${
          currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-ink/10 hover:border-ink/25 bg-ink/5"
        }`}
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-5 h-5 text-ink" />
      </Link>
    </div>
  );
}
