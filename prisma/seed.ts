import "dotenv/config";
import { prisma } from "../src/db.js";
import { slugify } from "../src/utils/slug.js";

async function main() {
  await prisma.news.deleteMany();
  await prisma.author.deleteMany();

  const authors = await prisma.author.createMany({
    data: [
      { name: "Alice Author", email: "alice@example.com" },
      { name: "Bob Writer", email: "bob@example.com" },
      { name: "Cara Editor", email: "cara@example.com" },
      { name: "Dan Reporter", email: "dan@example.com" },
    ],
  });

  const allAuthors = await prisma.author.findMany();
  const authorIds = allAuthors.map((a) => a.id);

  const items = Array.from({ length: 11 }).map((_, idx) => {
    const title = `News item ${idx + 1}`;
    const base = slugify(title) || `news-${idx + 1}`;
    return {
      title,
      summary: `Summary for ${title}`,
      content: `Content for ${title}. This is seeded text.`,
      slug: `${base}-${Date.now()}-${idx}`,
      published: idx % 2 === 0,
      authorId: authorIds[idx % authorIds.length],
    };
  });

  await prisma.news.createMany({ data: items });

  console.log("Seed complete:", { authors: authors.count, news: items.length });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });