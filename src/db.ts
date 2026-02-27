import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing (check .env in project root)");
}

const adapter = new PrismaPg({
  connectionString,
  // Neon/managed Postgres: best to allow certs unless you have CA bundle
  ssl: { rejectUnauthorized: false },
});

export const prisma = new PrismaClient({ adapter });