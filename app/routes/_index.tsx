import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { hc } from "hono/client";
import type { AppType } from "server";

export const loader = (args: LoaderFunctionArgs) => {
	const extra = args.context.extra;
	const cloudflare = args.context.cloudflare;
	const myVarInVariables = args.context.hono.context.get("MY_VAR_IN_VARIABLES");
	const isWaitUntilDefined = !!cloudflare.ctx.waitUntil;
	return { cloudflare, extra, myVarInVariables, isWaitUntilDefined };
};

export const action = async ({ context }: ActionFunctionArgs) => {
	const client = hc<AppType>(context.cloudflare.env.BASE_URL);
	const response = await client.api.users.$post({
		json: {
			name: "young man",
			age: 20,
		},
	});
	const { message } = await response.json();
	return message;
};

export default function Index() {
	const { cloudflare, extra, myVarInVariables, isWaitUntilDefined } =
		useLoaderData<typeof loader>();

	const message = useActionData<typeof action>();

	return (
		<div>
			<h1>Remix and Hono</h1>
			<h2>Var is {cloudflare.env.MY_VAR}</h2>
			<h3>
				{cloudflare.cf ? "cf," : ""}
				{cloudflare.ctx ? "ctx," : ""}
				{cloudflare.caches ? "caches are available" : ""}
			</h3>
			<h4>Extra is {extra}</h4>
			<h5>Var in Variables is {myVarInVariables}</h5>
			<h6>waitUntil is {isWaitUntilDefined ? "defined" : "not defined"}</h6>

			<Form method="post">
				<button type="submit">送信</button>
			</Form>

			{message && (
				<div>
					<h2>送信結果</h2>
					<p>{message}</p>
				</div>
			)}
		</div>
	);
}
