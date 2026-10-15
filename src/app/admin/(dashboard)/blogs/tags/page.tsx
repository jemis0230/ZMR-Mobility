import { listTags } from "@/lib/blog/queries";
import BlogAdminTabs from "@/presentation/components/blog-admin/BlogAdminTabs";
import ManageTagsClient from "@/presentation/components/blog-admin/ManageTagsClient";

export const dynamic = "force-dynamic";

export default async function ManageTagsPage() {
  const tags = await listTags(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Manage tags</h1>
        <p className="text-ink/60 text-sm mt-1">Topic tags readers use to browse the blog. Counts include drafts.</p>
      </div>
      <BlogAdminTabs current="tags" />
      <ManageTagsClient tags={tags} />
    </div>
  );
}
