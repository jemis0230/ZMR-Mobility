import BlogForm from "@/presentation/components/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-ink">Create New Article</h1>
        <p className="text-ink/60 text-sm mt-1">Fill in the details to publish a new blog post</p>
      </div>
      <BlogForm />
    </div>
  );
}
