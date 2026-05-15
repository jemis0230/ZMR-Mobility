export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  tags: string | null;
  published: boolean;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogRepository {
  findAll(filters?: { 
    category?: string; 
    search?: string; 
    publishedOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ blogs: BlogPost[]; total: number }>;
  
  findById(id: string): Promise<BlogPost | null>;
  findBySlug(slug: string): Promise<BlogPost | null>;
  create(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<BlogPost>;
  update(id: string, data: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt">>): Promise<BlogPost>;
  delete(id: string): Promise<void>;
  getCategories(): Promise<string[]>;
}
