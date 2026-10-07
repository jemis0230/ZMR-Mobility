import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { ok, created, badRequest } from '@/app/api/_lib/response';
import { TestDriveSchema, TEST_DRIVE_CITIES } from '@/lib/schemas/testDrive';

export const dynamic = 'force-dynamic';

const listed = { OR: [{ showInBuying: true }, { showInLeasing: true }, { showInRent: true }] };

// GET /api/test-drive — vehicles currently listed on the site, for the optional vehicle picker.
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: listed,
      select: { id: true, make: true, model: true, manufactureYear: true },
      orderBy: [{ make: 'asc' }, { model: 'asc' }],
    });
    return ok(
      vehicles.map((v) => ({
        id: v.id,
        label: `${v.manufactureYear ? `${v.manufactureYear} ` : ''}${v.make} ${v.model}`,
      })),
    );
  } catch (error) {
    console.error('[test-drive] vehicle list failed', error);
    return Response.json({ success: false, error: 'Vehicle list is unavailable right now.' }, { status: 503 });
  }
}

// POST /api/test-drive — public. Stores the request as a lead labelled TEST_DRIVE.
// The preferred date is a preference only; the team calls back to confirm a time.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid request.');
  }

  const parsed = TestDriveSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return badRequest(issue?.message ?? 'Invalid input', { field: issue?.path?.[0] });
  }
  const { name, phone, city, vehicleId, preferredDate, message, website } = parsed.data;

  // Bots fill the hidden field; pretend success without storing anything.
  if (website) return created({ submitted: true });

  try {
    let vehicleName: string | null = null;
    if (vehicleId) {
      const v = await prisma.vehicle.findFirst({ where: { id: vehicleId, ...listed }, select: { make: true, model: true, manufactureYear: true } });
      if (!v) return badRequest('That vehicle is no longer available. Please choose another or leave it blank.', { field: 'vehicleId' });
      vehicleName = `${v.manufactureYear ? `${v.manufactureYear} ` : ''}${v.make} ${v.model}`;
    }

    const state = TEST_DRIVE_CITIES.find((c) => c.city === city)?.state ?? '';
    await prisma.lead.create({
      data: {
        name,
        phone,
        city,
        state,
        inquiryType: 'TEST_DRIVE',
        vehicleId,
        vehicleName,
        preferredDate: new Date(`${preferredDate}T00:00:00Z`),
        notes: message,
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/leads');
    return created({ submitted: true });
  } catch (error) {
    console.error('[test-drive] could not save request', error);
    return Response.json(
      { success: false, error: 'We couldn’t save your request right now. Please try again or call us.' },
      { status: 500 },
    );
  }
}
