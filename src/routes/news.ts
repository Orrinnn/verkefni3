import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../db.js";
import { parsePaging } from "../utils/paging.js";
import { cleanText } from "../utils/sanitize.js";
import { slugify } from "../utils/slug.js";

export const newsRoute = new Hono();

const NewsCreateSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  content: z.string().min(1),
  authorId: z.number().int().positive(),
  published: z.boolean().optional(),
});

const NewsUpdateSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    summary: z.string().min(1).max(500).optional(),
    content: z.string().min(1).optional(),
    authorId: z.number().int().positive().optional(),
    published: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field must be provided");

newsRoute.get("/", async (c) => {
  const { limit, offset } = parsePaging(c.req.query());

  const [total, data] = await Promise.all([
    prisma.news.count(),
    prisma.news.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
  ]);

  return c.json({ data, paging: { limit, offset, total } }, 200);
});

newsRoute.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const item = await prisma.news.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item, 200);
});

newsRoute.post("/", zValidator("json", NewsCreateSchema), async (c) => {
  const body = c.req.valid("json");

  // check author exists
  const author = await prisma.author.findUnique({ where: { id: body.authorId } });
  if (!author) return c.json({ error: "Author not found" }, 404);

  const title = cleanText(body.title);
  const summary = cleanText(body.summary);
  const content = cleanText(body.content);

  // slug from title + avoid collisions
  const base = slugify(title) || `news-${Date.now()}`;
  let slug = base;
  let i = 1;
  while (await prisma.news.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${base}-${i}`;
  }

  const created = await prisma.news.create({
    data: {
      slug,
      title,
      summary,
      content,
      published: body.published ?? false,
      authorId: body.authorId,
    },
    include: { author: true },
  });

  return c.json(created, 201);
});

newsRoute.put("/:slug", zValidator("json", NewsUpdateSchema), async (c) => {
  const slug = c.req.param("slug");
  const body = c.req.valid("json");

  const existing = await prisma.news.findUnique({ where: { slug } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  if (body.authorId !== undefined) {
    const author = await prisma.author.findUnique({ where: { id: body.authorId } });
    if (!author) return c.json({ error: "Author not found" }, 404);
  }

  const updated = await prisma.news.update({
    where: { slug },
    data: {
      ...(body.title !== undefined ? { title: cleanText(body.title) } : {}),
      ...(body.summary !== undefined ? { summary: cleanText(body.summary) } : {}),
      ...(body.content !== undefined ? { content: cleanText(body.content) } : {}),
      ...(body.authorId !== undefined ? { authorId: body.authorId } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
    },
    include: { author: true },
  });

  return c.json(updated, 200);
});

newsRoute.delete("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const existing = await prisma.news.findUnique({ where: { slug } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.news.delete({ where: { slug } });
  return c.body(null, 204);
});