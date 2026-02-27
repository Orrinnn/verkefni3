import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { authorsRoute } from "./routes/authors.js";
import { newsRoute } from "./routes/news.js";

const app = new Hono();

app.get("/", (c) =>
  c.json(
    {
      message: "Verkefni 3 API",
      routes: {
        authors: ["/authors", "/authors/:id"],
        news: ["/news", "/news/:slug"],
      },
      paging: "Use ?limit=10&offset=0 on GET /authors and GET /news",
    },
    200
  )
);

app.route("/authors", authorsRoute);
app.route("/news", newsRoute);

// basic error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

const port = Number(process.env.PORT ?? "3000");
serve({ fetch: app.fetch, port });
console.log(`Server running on http://localhost:${port}`);