import prisma from "@/lib/prisma";
import { IBlogRepository, BlogPost } from "@/application/repositories/IBlogRepository";
import { Prisma } from "@prisma/client";

export class PrismaBlogRepository implements IBlogRepository {
  async findAll(filters?: {
    category?: string;
    search?: string;
    tag?: string;
    publishedOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ blogs: BlogPost[]; total: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BlogPostWhereInput = {};

    if (filters?.category && filters.category !== "All") {
      where.category = filters.category;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
        { excerpt: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters?.tag) {
      where.tags = { has: filters.tag };
    }
    if (filters?.publishedOnly) {
      where.published = true;
    }

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.blogPost.count({ where }),
    ]);

    return { blogs, total };
  }

  async findById(id: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({ where: { slug } });
  }

  async create(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<BlogPost> {
    return prisma.blogPost.create({ data });
  }

  async update(id: string, data: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt">>): Promise<BlogPost> {
    return prisma.blogPost.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.blogPost.delete({ where: { id } });
  }

  /** Tags used by published posts, most used first. */
  async getTags(): Promise<{ tag: string; count: number }[]> {
    const rows = await prisma.blogPost.findMany({ where: { published: true }, select: { tags: true } });
    const counts = new Map<string, number>();
    rows.forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }

  async getCategories(): Promise<string[]> {
    const rows = await prisma.blogPost.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return rows.map((r) => r.category);
  }
}
