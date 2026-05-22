import type { MetadataRoute } from 'next';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { PrismaBuyingVehicleRepository } from '@/infrastructure/repositories/PrismaBuyingVehicleRepository';
import { slugifyVehicle } from '@/lib/vehicleSlug';
import { CATEGORY_TO_SLUG } from '@/lib/constants';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // regenerate every hour

const BASE = 'https://zmrmobility.in';

const vehicleRepo = new PrismaVehicleRepository();
const buyingRepo = new PrismaBuyingVehicleRepository();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                    priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${BASE}/about`,               priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/blogs`,               priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${BASE}/sell-ev`,             priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/compare`,             priority: 0.6, changeFrequency: 'weekly'  },
    { url: `${BASE}/privacy-policy`,      priority: 0.3, changeFrequency: 'yearly'  },
    { url: `${BASE}/terms-and-conditions`,priority: 0.3, changeFrequency: 'yearly'  },
  ];

  // ── Category listing pages (leasing + buying) ────────────────
  const categorySlugs = Object.values(CATEGORY_TO_SLUG);

  const leasingCategories: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE}/leasing/vehicles/${slug}`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  const buyingCategories: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE}/buying/vehicles/${slug}`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  // ── Dynamic vehicle detail pages ─────────────────────────────
  const [leasingVehicles, buyingVehicles, blogPosts] = await Promise.all([
    vehicleRepo.findAll(),
    buyingRepo.findAll(),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const leasingVehiclePages: MetadataRoute.Sitemap = leasingVehicles.map((v) => ({
    url: `${BASE}/vehicles/${slugifyVehicle(v.make, v.model, v.id)}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  const buyingVehiclePages: MetadataRoute.Sitemap = buyingVehicles.map((v) => ({
    url: `${BASE}/buying/vehicles/detail/${slugifyVehicle(v.make, v.model, v.id)}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  // ── Blog posts ───────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blogs/${post.slug}`,
    lastModified: post.updatedAt,
    priority: 0.7,
    changeFrequency: 'monthly',
  }));

  return [
    ...staticPages,
    ...leasingCategories,
    ...buyingCategories,
    ...leasingVehiclePages,
    ...buyingVehiclePages,
    ...blogPages,
  ];
}
