import { listTypes } from "@/lib/blog/queries";
import BlogAdminTabs from "@/presentation/components/blog-admin/BlogAdminTabs";
import ManageNamedItemsClient from "@/presentation/components/blog-admin/ManageNamedItemsClient";

export const dynamic = "force-dynamic";

export default async function ManageBlogTypesPage() {
  const types = await listTypes(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Manage blog types</h1>
        <p className="text-ink/60 text-sm mt-1">Each article has one type, such as Opinion, Explainer or Press. Counts include drafts.</p>
      </div>
      <BlogAdminTabs current="types" />
      <ManageNamedItemsClient kind="type" items={types} />
    </div>
  );
}
