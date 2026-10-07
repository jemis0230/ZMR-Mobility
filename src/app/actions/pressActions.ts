'use server';

import prisma from '@/lib/prisma';
import { toPressDTO, type PressMentionDTO } from '@/lib/press';

/** Published press mentions, newest first (manual sort order wins). */
export async function getPressMentions(): Promise<PressMentionDTO[]> {
  try {
    const rows = await prisma.pressMention.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    });
    return rows.map(toPressDTO);
  } catch (error) {
    console.error('Get press mentions error:', error);
    return [];
  }
}

export async function getAllPressMentionsAdmin(): Promise<{ data: PressMentionDTO[]; dbError: boolean }> {
  try {
    const rows = await prisma.pressMention.findMany({
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    });
    return { data: rows.map(toPressDTO), dbError: false };
  } catch (error) {
    console.error('Get press mentions (admin) error:', error);
    return { data: [], dbError: true };
  }
}
