import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import type { Bindings } from "types";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", secureHeaders(), csrf());

app.get("/:id", async (c) => {
	const id = c.req.param("id");

	const url = await c.env.URL_SHORTER.get(id);

	if (!url) {
		return c.json({ error: "URL not found" }, 404);
	}

	return c.redirect(url);
});

export default app;
