"use server";

import { PrismaBlogRepository } from "@/infrastructure/repositories/PrismaBlogRepository";
import { revalidatePath } from "next/cache";
import { saveUploadedFile } from "@/lib/upload";

const getRepo = () => new PrismaBlogRepository();

/** Accepts "a, b, c" or ["a","b"] and returns up to 10 unique, trimmed tags. */
function normalizeTags(input: unknown): string[] {
  const list = Array.isArray(input) ? input : typeof input === "string" ? input.split(",") : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const t = String(raw).trim().replace(/\s+/g, " ").slice(0, 40);
    const key = t.toLowerCase();
    if (t && !seen.has(key)) { seen.add(key); out.push(t); }
  }
  return out.slice(0, 10);
}

function normalizeBlogInput(data: any) {
  const out = { ...data };
  if ("tags" in out) out.tags = normalizeTags(out.tags);
  if (typeof out.authorName === "string") out.authorName = out.authorName.trim() || "ZMR Mobility Team";
  return out;
}

export async function getBlogsAction(filters?: any) {
  try {
    const blogRepo = getRepo();
    return await blogRepo.findAll(filters);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { blogs: [], total: 0 };
  }
}

export async function getBlogBySlugAction(slug: string) {
  try {
    const blogRepo = getRepo();
    return await blogRepo.findBySlug(slug);
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
}

export async function createBlogAction(data: any) {
  try {
    const blogRepo = getRepo();
    const blog = await blogRepo.create(normalizeBlogInput(data));
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    return { success: true, data: blog };
  } catch (error: any) {
    console.error("SERVER ACTION ERROR: createBlogAction failed:", error);
    return { success: false, error: error.message || "Failed to create blog" };
  }
}

export async function updateBlogAction(id: string, data: any) {
  try {
    const blogRepo = getRepo();
    const blog = await blogRepo.update(id, normalizeBlogInput(data));
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath("/admin/blogs");
    return { success: true, data: blog };
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return { success: false, error: error.message || "Failed to update blog" };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    const blogRepo = getRepo();
    await blogRepo.delete(id);
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: "Failed to delete blog" };
  }
}

export async function getBlogTagsAction() {
  try {
    return await getRepo().getTags();
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    return [];
  }
}

export async function getBlogCategoriesAction() {
  try {
    const blogRepo = getRepo();
    return await blogRepo.getCategories();
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
}

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No file uploaded" };
    }
    const url = await saveUploadedFile(file, "uploads/blogs");
    return { success: true, url };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to upload image" };
  }
}
