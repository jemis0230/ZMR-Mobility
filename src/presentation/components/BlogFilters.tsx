"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Opt = { value: string; label: string };

const SELECT =
  "w-full min-h-[44px] rounded-xl border border-ink/15 bg-white px-3 text-sm font-semibold text-forest focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";

/** Search plus Type / Topic / Author filters. Every filter lives in the URL. */
export default function BlogFilters({ types, tags, authors }: { types: Opt[]; tags: Opt[]; authors: Opt[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const go = (params: URLSearchParams) => {
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/blogs?${qs}` : "/blogs", { scroll: false });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if ((params.get("q") ?? "") === searchValue) return;
      if (searchValue) params.set("q", searchValue); else params.delete("q");
      go(params);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    go(params);
  };

  const select = (key: "type" | "tag" | "author", label: string, all: string, opts: Opt[]) => (
    <div>
      <label htmlFor={`blog-filter-${key}`} className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/70">{label}</label>
      <select id={`blog-filter-${key}`} name={key} value={searchParams.get(key) ?? ""} onChange={(e) => setParam(key, e.target.value)} className={SELECT}>
        <option value="">{all}</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <form
      role="search"
      aria-label="Filter articles"
      action="/blogs"
      method="get"
      onSubmit={(e) => { e.preventDefault(); setParam("q", searchValue); }}
      className="mb-8 space-y-4"
    >
      <div className="relative max-w-2xl mx-auto">
        <div className="relative rounded-2xl bg-white border border-ink/15 flex items-center px-5 py-1.5 shadow-card focus-within:border-primary">
          <Search className="w-5 h-5 text-leaf mr-3 shrink-0" aria-hidden />
          <input
            type="search"
            name="q"
            aria-label="Search articles"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search articles"
            className="bg-transparent flex-1 min-w-0 min-h-[44px] outline-none text-ink placeholder:text-ink/55 font-medium"
          />
          {searchValue && (
            <button type="button" aria-label="Clear search" onClick={() => setSearchValue("")} className="w-10 h-10 -mr-2 flex items-center justify-center text-ink/60 hover:text-ink">
              <X className="w-4 h-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto">
        {select("type", "Type", "All types", types)}
        {select("tag", "Topic", "All topics", tags)}
        {select("author", "Author", "All authors", authors)}
      </div>
      <noscript>
        <div className="text-center"><button type="submit" className="min-h-[44px] rounded-xl bg-primary px-5 text-sm font-bold text-white">Apply filters</button></div>
      </noscript>
    </form>
  );
}
