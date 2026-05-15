const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const v = await prisma.vehicle.findMany({
    where: { category: "3 Wheeler (Passenger)" }
  });
  console.log(v.map(x => ({ id: x.id, make: x.make, model: x.model, payload: x.payload })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
