import Link from "next/link";

const TABS = [
  { key: "posts", label: "Articles", href: "/admin/blogs" },
  { key: "tags", label: "Tags", href: "/admin/blogs/tags" },
  { key: "authors", label: "Authors", href: "/admin/blogs/authors" },
  { key: "types", label: "Blog types", href: "/admin/blogs/types" },
] as const;

export default function BlogAdminTabs({ current }: { current: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="Blog management" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={t.key === current ? "page" : undefined}
          className={`shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-full text-sm font-bold border transition-colors ${
            t.key === current ? "bg-primary text-white border-primary" : "bg-white text-forest border-ink/15 hover:border-primary"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
