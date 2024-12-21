import { vValidator } from "@hono/valibot-validator";
import { urls } from "db/schema";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { nanoid } from "nanoid";
import type { Bindings } from "types";
import { url, number, object, pipe, string } from "valibot";
import { calculateJSTExpirationISO, generateJSTISOTime } from "./utils";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", secureHeaders());

app.get("/:id", async (c) => {
	const id = c.req.param("id");

	const url = await c.env.URL_SHORTER.get(id);

	if (!url) {
		return c.json({ error: "URL not found" }, 404);
	}

	return c.redirect(url);
});

const schema = object({
	url: pipe(string(), url()),
	expirationDays: number(),
	baseUrl: pipe(string(), url()),
});

const appRouter = app.post(
	"/shorter",
	cors({
		origin: "https://url-shorter-cf.daichi2mori.workers.dev/",
		allowMethods: ["POST"],
		credentials: false,
	}),
	(c, next) => {
		const auth = bearerAuth({ token: c.env.API_KEY });
		return auth(c, next);
	},
	vValidator("json", schema),
	async (c) => {
		const { url, expirationDays, baseUrl } = c.req.valid("json");
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

		const shortUrl = `${baseUrl}${result.id}`;

		await c.env.URL_SHORTER.put(id, url);

		c.header("Content-Type", "application/json");

		return c.json({ shortUrl, expirationDate }, 201);
	},
);

export type AppType = typeof appRouter;

export default app;
