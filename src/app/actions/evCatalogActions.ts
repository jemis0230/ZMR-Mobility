'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';
import { VEHICLE_CATEGORIES, type VehicleCategory } from '@/lib/constants';
import { VehicleCategory as PrismaVehicleCategory } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type BrandItem = {
  id: string;
  name: string;
  categories: string[];
  isActive: boolean;
  modelCount: number;
  createdAt: string;
};

export type ModelItem = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  photo: string | null;
  category: string;
  isActive: boolean;
  createdAt: string;
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function saveModelPhoto(file: File): Promise<string> {
  return saveUploadedFile(file, 'uploads/ev-models');
}

// ─────────────────────────────────────────────────────────────
// Brand actions
// ─────────────────────────────────────────────────────────────

export async function getBrands(category?: string): Promise<{ success: boolean; data?: { id: string; name: string; categories: string[] }[]; error?: string }> {
  try {
    const brands = await prisma.evBrand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, categories: true },
    });
    const parsed = brands.map((b) => ({
      id: b.id,
      name: b.name,
      categories: b.categories as string[],
    }));
    if (!category) return { success: true, data: parsed };
    return { success: true, data: parsed.filter((b) => b.categories.includes(category)) };
  } catch (error) {
    console.error('getBrands error:', error);
    return { success: false, error: 'Failed to load brands.' };
  }
}

export async function getAllBrandsAdmin(): Promise<{ success: boolean; data?: BrandItem[]; error?: string }> {
  try {
    const brands = await prisma.evBrand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { models: true } } },
    });
    return {
      success: true,
      data: brands.map((b) => ({
        id: b.id,
        name: b.name,
        categories: b.categories as string[],
        isActive: b.isActive,
        modelCount: b._count.models,
        createdAt: b.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('getAllBrandsAdmin error:', error);
    return { success: false, error: 'Failed to load brands.' };
  }
}

export async function createBrand(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  if (!name || name.length < 1) return { success: false, error: 'Brand name is required.' };
  const categories = (formData.getAll('categories') as string[]).filter((c): c is VehicleCategory =>
    VEHICLE_CATEGORIES.includes(c as VehicleCategory)
  );

  try {
    await prisma.evBrand.create({ data: { name, categories } });
    revalidatePath('/admin/ev-catalog');
    return { success: true };
  } catch (error) {
    console.error('createBrand error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create brand.' };
  }
}

export async function updateBrand(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  const isActive = formData.get('isActive') === 'true';
  const categories = (formData.getAll('categories') as string[]).filter((c): c is VehicleCategory =>
    VEHICLE_CATEGORIES.includes(c as VehicleCategory)
  );
  if (!name) return { success: false, error: 'Brand name is required.' };

  try {
    await prisma.evBrand.update({ where: { id }, data: { name, isActive, categories } });
    revalidatePath('/admin/ev-catalog');
    return { success: true };
  } catch (error) {
    console.error('updateBrand error:', error);
    return { success: false, error: 'Failed to update brand.' };
  }
}

export async function deleteBrand(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.evBrand.delete({ where: { id } });
    revalidatePath('/admin/ev-catalog');
    return { success: true };
  } catch (error) {
    console.error('deleteBrand error:', error);
    return { success: false, error: 'Failed to delete brand.' };
  }
}

// ─────────────────────────────────────────────────────────────
// Model actions
// ─────────────────────────────────────────────────────────────

export async function getModelsByBrand(
  brandId: string,
  category?: string,
): Promise<{ success: boolean; data?: { id: string; name: string; photo: string | null }[]; error?: string }> {
  try {
    const models = await prisma.evBrandModel.findMany({
      where: {
        brandId,
        isActive: true,
        ...(category ? { category: category as PrismaVehicleCategory } : {}),
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, photo: true },
    });
    return { success: true, data: models };
  } catch (error) {
    console.error('getModelsByBrand error:', error);
    return { success: false, error: 'Failed to load models.' };
  }
}

export async function getAllModelsAdmin(brandId?: string): Promise<{ success: boolean; data?: ModelItem[]; error?: string }> {
  try {
    const models = await prisma.evBrandModel.findMany({
      where: brandId ? { brandId } : undefined,
      orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }],
      include: { brand: { select: { name: true } } },
    });
    return {
      success: true,
      data: models.map((m) => ({
        id: m.id,
        name: m.name,
        brandId: m.brandId,
        brandName: m.brand.name,
        photo: m.photo,
        category: m.category,
        isActive: m.isActive,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('getAllModelsAdmin error:', error);
    return { success: false, error: 'Failed to load models.' };
  }
}

export async function createModel(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  const brandId = (formData.get('brandId') as string)?.trim();
  const category = (formData.get('category') as string)?.trim() ?? '';
  if (!name) return { success: false, error: 'Model name is required.' };
  if (!brandId) return { success: false, error: 'Brand is required.' };

  try {
    let photo: string | null = null;
    const photoFile = formData.get('photo') as File | null;
    if (photoFile && photoFile.size > 0) {
      photo = await saveModelPhoto(photoFile);
    }
    await prisma.evBrandModel.create({ data: { name, brandId, photo, category: category as PrismaVehicleCategory } });
    revalidatePath('/admin/ev-catalog');
    return { success: true };
  } catch (error) {
    console.error('createModel error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create model.' };
  }
}

export async function updateModel(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = (formData.get('name') as string)?.trim();
  const isActive = formData.get('isActive') === 'true';
  const category = (formData.get('category') as string)?.trim() ?? '';
  if (!name) return { success: false, error: 'Model name is required.' };

  try {
    const data: { name: string; isActive: boolean; category: PrismaVehicleCategory; photo?: string } = { name, isActive, category: category as PrismaVehicleCategory };
    const photoFile = formData.get('photo') as File | null;
    if (photoFile && photoFile.size > 0) {
      data.photo = await saveModelPhoto(photoFile);
    }
    await prisma.evBrandModel.update({ where: { id }, data });
    revalidatePath('/admin/ev-catalog');
    return { success: true };
  } catch (error) {
    console.error('updateModel error:', error);
    return { success: false, error: 'Failed to update model.' };
  }
}

export async function deleteModel(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.evBrandModel.delete({ where: { id } });
    revalidatePath('/admin/ev-catalog');
    return { success: true };
  } catch (error) {
    console.error('deleteModel error:', error);
    return { success: false, error: 'Failed to delete model.' };
  }
}
