import { vValidator } from "@hono/valibot-validator";
import { urls } from "db/schema";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Bindings } from "types";
import { number, object, string } from "valibot";
import { calculateJSTExpirationISO, generateJSTISOTime } from "./utils";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:id", async (c) => {
	const id = c.req.param("id");

	const url = await c.env.URL_SHORTER.get(id);

	if (!url) {
		return c.json({ error: "URL not found" }, 404);
	}

	return c.redirect(url);
});

app.get("/url/all", async (c) => {
	const db = drizzle(c.env.DB);
	const urlList = await db.select().from(urls).all();
	return c.json(urlList);
});

const schema = object({
	url: string(),
	expirationDays: number(),
});

const appRouter = app.post("shorter", vValidator("json", schema), async (c) => {
	const { url, expirationDays } = c.req.valid("json");
	const id = nanoid(8);
	const expirationDate = calculateJSTExpirationISO(expirationDays);

	const db = drizzle(c.env.DB);
	const result = await db
		.insert(urls)
		.values({
			id: id,
			originalUrl: url,
			expirationDate: expirationDate,
			createdAt: generateJSTISOTime().toISOString(),
		})
		.returning({ id: urls.id })
		.get();

	const shortUrl = `${c.env.BASE_URL}/${result.id}`;

	await c.env.URL_SHORTER.put(id, url);

	return c.json({ shortUrl, expirationDate });
});

export type AppType = typeof appRouter;

export default app;
