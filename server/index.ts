import { vValidator } from "@hono/valibot-validator";
import { urls } from "db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { Bindings } from "types";
import { number, object, string } from "valibot";
import {
	calculateJSTExpirationISO,
	generateJSTISOTime,
	isPastDate,
} from "./utils";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:id", async (c) => {
	const id = c.req.param("id");

	const db = drizzle(c.env.DB);
	const url = await db.select().from(urls).where(eq(urls.id, id)).get();
	if (!url) {
		return c.json({ error: "URL not found" }, 404);
	}

	if (isPastDate(url.expirationDate)) {
		return c.json({ error: "URL expired" }, 410);
	}

	return c.redirect(url.originalUrl);
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

	return c.json({ shortUrl, expirationDate });
});

export type AppType = typeof appRouter;

export default app;
