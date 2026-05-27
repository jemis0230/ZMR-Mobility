import prisma from '@/lib/prisma';
import VehicleConfigClient from './VehicleConfigClient';

export const dynamic = 'force-dynamic';

export default async function VehicleConfigPage() {
  const [batteryTypes, motorTypes] = await Promise.all([
    prisma.batteryType.findMany({ orderBy: { name: 'asc' } }),
    prisma.motorType.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return <VehicleConfigClient initialBatteryTypes={batteryTypes} initialMotorTypes={motorTypes} />;
}
