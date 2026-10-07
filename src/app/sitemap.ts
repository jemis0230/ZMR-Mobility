import type { MetadataRoute } from 'next';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { slugifyVehicle } from '@/lib/vehicleSlug';
import { CATEGORY_TO_SLUG } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';
import { BODY_TYPES, bodyTypeHref } from '@/lib/explore';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE = SITE_URL;

const vehicleRepo = new PrismaVehicleRepository();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                     priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${BASE}/explore`,              priority: 0.9, changeFrequency: 'daily'   },
    ...BODY_TYPES.map((b) => ({ url: `${BASE}${bodyTypeHref(b)}`, priority: 0.7, changeFrequency: 'daily' as const })),
    { url: `${BASE}/warranty-ownership`,   priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/press`,                priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/about`,                priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/blogs`,                priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${BASE}/sell-ev`,              priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/compare`,              priority: 0.6, changeFrequency: 'weekly'  },
    { url: `${BASE}/privacy-policy`,       priority: 0.3, changeFrequency: 'yearly'  },
    { url: `${BASE}/terms-and-conditions`, priority: 0.3, changeFrequency: 'yearly'  },
  ];

  // ── Category listing pages (leasing + buying + rent) ─────────
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

  const rentCategories: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE}/rent/vehicles/${slug}`,
    priority: 0.9,
    changeFrequency: 'weekly',
  }));

  // ── Dynamic vehicle detail pages ─────────────────────────────
  const [allVehicles, blogPosts] = await Promise.all([
    vehicleRepo.findAll(),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const leasingVehiclePages: MetadataRoute.Sitemap = allVehicles
    .filter((v) => v.showInLeasing)
    .map((v) => ({
      url: `${BASE}/vehicles/${slugifyVehicle(v.make, v.model, v.id)}`,
      priority: 0.8,
      changeFrequency: 'weekly',
    }));

  const buyingVehiclePages: MetadataRoute.Sitemap = allVehicles
    .filter((v) => v.showInBuying)
    .map((v) => ({
      url: `${BASE}/buying/vehicles/detail/${slugifyVehicle(v.make, v.model, v.id)}`,
      priority: 0.8,
      changeFrequency: 'weekly',
    }));

  const rentVehiclePages: MetadataRoute.Sitemap = allVehicles
    .filter((v) => v.showInRent)
    .map((v) => ({
      url: `${BASE}/rent/vehicles/detail/${slugifyVehicle(v.make, v.model, v.id)}`,
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
    ...rentCategories,
    ...leasingVehiclePages,
    ...buyingVehiclePages,
    ...rentVehiclePages,
    ...blogPages,
  ];
}
