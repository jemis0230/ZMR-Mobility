import BlogForm from "@/presentation/components/BlogForm";
import { PrismaBlogRepository } from "@/infrastructure/repositories/PrismaBlogRepository";
import { notFound } from "next/navigation";

export default async function EditBlogPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const blogRepo = new PrismaBlogRepository();
  const blog = await blogRepo.findById(params.id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white">Edit Article</h1>
        <p className="text-white/40 text-sm mt-1">Make changes to your article below</p>
      </div>
      <BlogForm initialData={blog} />
    </div>
  );
}
