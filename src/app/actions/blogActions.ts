"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";
import * as m from "@/lib/blog/mutations";
import type { Result } from "@/lib/blog/mutations";

// Every action here is a public endpoint as far as the network is concerned, so each
// one checks the staff session itself. Reads live in src/lib/blog/queries.ts.

const DENIED = { success: false as const, error: "Your session has expired. Please sign in again." };

async function staff<T>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  if (!(await getSession())) return DENIED;
  const res = await fn();
  if (res.success) refreshBlogPages();
  return res;
}

/** Listings, tag pages and articles all show taxonomy, so refresh everything under /blogs. */
function refreshBlogPages() {
  revalidatePath("/blogs", "layout");
  revalidatePath("/admin/blogs", "layout");
  revalidatePath("/sitemap.xml");
}

// Posts
export async function savePostAction(id: string | null, data: unknown) { return staff(() => m.savePost(id, data)); }
export async function deletePostAction(id: string) { return staff(() => m.deletePost(id)); }

// Tags
export async function createTagAction(data: unknown) { return staff(() => m.createTag(data)); }
export async function renameTagAction(id: string, data: unknown) { return staff(() => m.renameTag(id, data)); }
export async function previewTagMergeAction(data: unknown) {
  if (!(await getSession())) return DENIED;
  return m.previewTagMerge(data);
}
export async function mergeTagsAction(data: unknown) { return staff(() => m.mergeTags(data)); }
export async function deleteTagAction(id: string) { return staff(() => m.deleteTag(id)); }

// Authors
export async function createAuthorAction(data: unknown) { return staff(() => m.createAuthor(data)); }
export async function updateAuthorAction(id: string, data: unknown) { return staff(() => m.updateAuthor(id, data)); }
export async function deleteAuthorAction(id: string, reassignToId?: string | null) { return staff(() => m.deleteAuthor(id, reassignToId)); }

// Types
export async function createTypeAction(data: unknown) { return staff(() => m.createType(data)); }
export async function renameTypeAction(id: string, data: unknown) { return staff(() => m.renameType(id, data)); }
export async function deleteTypeAction(id: string, reassignToId?: string | null) { return staff(() => m.deleteType(id, reassignToId)); }

export async function uploadImageAction(formData: FormData) {
  if (!(await getSession())) return DENIED;
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { success: false as const, error: "No file uploaded" };
    const url = await saveUploadedFile(file, "uploads/blogs");
    return { success: true as const, url };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to upload image" };
  }
}
