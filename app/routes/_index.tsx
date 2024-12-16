import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { hc } from "hono/client";
import type { AppType } from "server";
import { url, pipe, safeParse, string } from "valibot";

export const action = async ({ context, request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const urlData = formData.get("url");

	const UrlSchema = pipe(string(), url());
	const result = safeParse(UrlSchema, urlData);

	if (result.success) {
		const url = result.output;
		const client = hc<AppType>(context.cloudflare.env.BASE_URL);
		const response = await client.shorter.$post({
			json: {
				url: url,
				expirationDays: 7,
			},
		});
		const { shortUrl, expirationDate } = await response.json();
		return Response.json({ shortUrl, expirationDate });
	}
};

export default function Index() {
	const fetcher = useFetcher<{ data: string }>();

	console.log(fetcher.data);

	return (
		<div>
			<h1>Remix and Hono</h1>

			<fetcher.Form method="post">
				<input
					type="text"
					name="url"
					placeholder="短縮したいURLを入力"
					className="outline"
				/>
				<button type="submit">送信</button>
			</fetcher.Form>
		</div>
	);
}
