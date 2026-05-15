import prisma from "@/lib/prisma";
import { IBlogRepository, BlogPost } from "@/application/repositories/IBlogRepository";
import { Prisma } from "@prisma/client";

export class PrismaBlogRepository implements IBlogRepository {
  async findAll(filters?: {
    category?: string;
    search?: string;
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
        { title: { contains: filters.search } },
        { content: { contains: filters.search } },
        { excerpt: { contains: filters.search } },
      ];
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

  async getCategories(): Promise<string[]> {
    const rows = await prisma.blogPost.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return rows.map((r) => r.category);
  }
}
