const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const category = "3 Wheeler (Cargo)";
  const where = { category };
  
  where.range = { lte: 200 };

  const count = await prisma.vehicle.count({ where });
  const vehicles = await prisma.vehicle.findMany({ where });

  console.log(`Found ${count} vehicles for category ${category} with range <= 200`);
  console.log(vehicles.map(v => ({ make: v.make, range: v.range })));
}

test().catch(console.error).finally(() => prisma.$disconnect());
