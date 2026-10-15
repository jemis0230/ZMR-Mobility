import { listAuthors } from "@/lib/blog/queries";
import BlogAdminTabs from "@/presentation/components/blog-admin/BlogAdminTabs";
import ManageNamedItemsClient from "@/presentation/components/blog-admin/ManageNamedItemsClient";

export const dynamic = "force-dynamic";

export default async function ManageAuthorsPage() {
  const authors = await listAuthors(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Manage authors</h1>
        <p className="text-ink/60 text-sm mt-1">Names and designations shown in article bylines. Counts include drafts.</p>
      </div>
      <BlogAdminTabs current="authors" />
      <ManageNamedItemsClient kind="author" items={authors} />
    </div>
  );
}
