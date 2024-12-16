import type { Context } from "hono";
import type { Bindings } from "types";
import type { PlatformProxy } from "wrangler";

type Env = {
	Bindings: Bindings;
};

type GetLoadContextArgs = {
	request: Request;
	context: {
		cloudflare: Omit<
			PlatformProxy<Env["Bindings"]>,
			"dispose" | "caches" | "cf"
		> & {
			caches: PlatformProxy<Env>["caches"] | CacheStorage;
			cf: Request["cf"];
		};
		hono: {
			context: Context<Env>;
		};
	};
};

declare module "@remix-run/cloudflare" {
	interface AppLoadContext extends ReturnType<typeof getLoadContext> {
		extra: string;
		hono: {
			context: Context<Env>;
		};
	}
}

export function getLoadContext({ context }: GetLoadContextArgs) {
	return {
		...context,
		extra: "stuff",
	};
}
