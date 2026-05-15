const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const data = {
    title: "Future oif ev in india ",
    slug: "future-oif-ev-in-india",
    excerpt: "hasukdha kjashjkdas hdkhjkd askdhakjs dkadasd",
    category: "EV Tech",
    coverImage: "/uploads/blogs/1778425207313-4WheelerCargoZMR.webp",
    content: "<ul><li><p>adsaasdasdasd</p></li><li><p>dssa</p></li></ul><blockquote><p>ddasda dasdas d asd asd asdasd</p></blockquote><p></p><p>as</p><ol><li><p>sdas</p></li><li><p>das</p></li><li><p>asd</p></li><li><p>ad</p></li><li><p>as</p></li></ol><pre><code></code></pre><h2>d dasdhaskjdhasjk dhajksdh ajkshdjkash djkashdkjash djkashkjd hasjkdhkajsd hkjashdkja </h2><h3>sdjkah dkjhajkdh aksdhjksahdjk ashjkdhasjk dhakjsd asdhkjashd ahsdkj askdhajk as</h3><h2></h2><p></p>",
    published: true,
    authorName: "ZMR Mobility Team",
    tags: ""
  };

  try {
    const blog = await prisma.blogPost.create({ data });
    console.log("Success:", blog.id);
  } catch (e) {
    console.error("Error:", e);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
