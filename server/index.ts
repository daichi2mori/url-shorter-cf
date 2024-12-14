import { vValidator } from "@hono/valibot-validator";
import { urls } from "db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { number, object, string } from "valibot";
import { calculateJSTExpirationISO, generateJSTISOTime } from "./utils";

type Bindings = {
	DB: D1Database;
	MY_VAR: string;
};

type Variables = {
	MY_VAR_IN_VARIABLES: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use(async (c, next) => {
	c.set("MY_VAR_IN_VARIABLES", "My variable set in c.set");
	await next();
	c.header("X-Powered-By", "Remix and Hono");
});

app.get("/:id", async (c) => {
	const id = c.req.param("id");

	const db = drizzle(c.env.DB);
	const url = await db.select().from(urls).where(eq(urls.id, id)).get();
	if (!url) {
		return c.json({ error: "URL not found" }, 404);
	}

	const now = new Date();
	if (new Date(url.expirationDate) < now) {
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
	name: string(),
	age: number(),
});

const appRouter = app.post("/api/users", vValidator("json", schema), (c) => {
	const data = c.req.valid("json");
	return c.json({
		message: `${data.name} is ${data.age.toString()} years old`,
	});
});

const urlSchema = object({
	url: string(),
	expirationDays: number(),
});

app.post("shorter", vValidator("json", urlSchema), async (c) => {
	const { url, expirationDays } = c.req.valid("json");
	const id = nanoid(8);

	const db = drizzle(c.env.DB);
	const result = await db
		.insert(urls)
		.values({
			id: id,
			originalUrl: url,
			expirationDate: calculateJSTExpirationISO(expirationDays),
			createdAt: generateJSTISOTime().toISOString(),
		})
		.returning()
		.get();

	return c.json(result);
});

export type AppType = typeof appRouter;

export default app;
