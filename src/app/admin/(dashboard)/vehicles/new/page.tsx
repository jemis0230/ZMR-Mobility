import AdminVehicleForm from '@/presentation/components/AdminVehicleForm';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewVehiclePage() {
  const [batteryTypes, motorTypes] = await Promise.all([
    prisma.batteryType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.motorType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/vehicles" className="flex items-center gap-2 text-ink/60 hover:text-ink transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicles
        </Link>
      </div>
      <AdminVehicleForm batteryTypes={batteryTypes} motorTypes={motorTypes} />
    </div>
  );
}
