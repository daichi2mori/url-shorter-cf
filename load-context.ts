import type { Context } from "hono";
import type { PlatformProxy } from "wrangler";

type Env = {
	Bindings: {
		MY_VAR: string;
	};
	Variables: {
		MY_VAR_IN_VARIABLES: string;
	};
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
