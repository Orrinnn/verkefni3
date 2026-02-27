import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../db.js";
import { parsePaging } from "../utils/paging.js";
import { cleanText } from "../utils/sanitize.js";

export const authorsRoute = new Hono();

const AuthorCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
});

const AuthorUpdateSchema = AuthorCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  "At least one field must be provided"
);

authorsRoute.get("/", async (c) => {
  const { limit, offset } = parsePaging(c.req.query());
  const [total, data] = await Promise.all([
    prisma.author.count(),
    prisma.author.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: { news: { select: { id: true, slug: true, title: true } } },
    }),
  ]);

  return c.json({ data, paging: { limit, offset, total } }, 200);
});

authorsRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

  const author = await prisma.author.findUnique({
    where: { id },
    include: { news: true },
  });

  if (!author) return c.json({ error: "Not found" }, 404);
  return c.json(author, 200);
});

authorsRoute.post("/", zValidator("json", AuthorCreateSchema), async (c) => {
  const body = c.req.valid("json");

  const created = await prisma.author.create({
    data: {
      name: cleanText(body.name),
      email: body.email.trim(),
    },
  });

  return c.json(created, 201);
});

authorsRoute.put("/:id", zValidator("json", AuthorUpdateSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

  const body = c.req.valid("json");

  const existing = await prisma.author.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const updated = await prisma.author.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: cleanText(body.name) } : {}),
      ...(body.email !== undefined ? { email: body.email.trim() } : {}),
    },
  });

  return c.json(updated, 200);
});

authorsRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400);

  const existing = await prisma.author.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.author.delete({ where: { id } });
  return c.body(null, 204);
});