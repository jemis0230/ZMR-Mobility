const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Models available in prisma client:");
  console.log(Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
