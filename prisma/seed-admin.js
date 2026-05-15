// Run once: node prisma/seed-admin.js
// Or with custom password: SEED_ADMIN_PASSWORD=YourPass node prisma/seed-admin.js
// Idempotent — safe to run multiple times.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'askhammad000@gmail.com';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists — skipping seed.');
    return;
  }

  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({
    data: {
      email,
      name: 'Hammad (Superadmin)',
      passwordHash,
      role: 'superadmin',
      isActive: true,
    },
  });

  console.log('');
  console.log('✅ Superadmin created successfully!');
  console.log('   Email:    ' + email);
  console.log('   Password: ' + password);
  console.log('');
  console.log('⚠️  Change this password immediately after first login!');
  console.log('');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
