import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { number, object, string } from "valibot";

const app = new Hono<{
	Bindings: {
		MY_VAR: string;
	};
	Variables: {
		MY_VAR_IN_VARIABLES: string;
	};
}>();

app.use(async (c, next) => {
	c.set("MY_VAR_IN_VARIABLES", "My variable set in c.set");
	await next();
	c.header("X-Powered-By", "Remix and Hono");
});

const routes = app.get("/api", (c) => {
	return c.json({
		message: "Hello",
		var: c.env.MY_VAR,
	});
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

export type AppType = typeof appRouter;

export default app;
