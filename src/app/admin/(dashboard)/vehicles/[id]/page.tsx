import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import AdminVehicleForm from '@/presentation/components/AdminVehicleForm';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const repo = new PrismaVehicleRepository();

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, batteryTypes, motorTypes] = await Promise.all([
    repo.findById(id),
    prisma.batteryType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.motorType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);
  if (!vehicle) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/vehicles" className="flex items-center gap-2 text-ink/60 hover:text-ink transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </Link>
        <span className="text-ink/40">·</span>
        <span className="text-ink/60 text-sm">{vehicle.make} {vehicle.model}</span>
      </div>
      <AdminVehicleForm initialData={vehicle} batteryTypes={batteryTypes} motorTypes={motorTypes} />
    </div>
  );
}
