const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.blogPost.findMany();
  console.log(JSON.stringify(blogs, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
