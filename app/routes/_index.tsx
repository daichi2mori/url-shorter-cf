import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { hc } from "hono/client";
import type { AppType } from "server";
import type { ActionResponse } from "types";
import { url, pipe, safeParse, string } from "valibot";

export const action = async ({ context, request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const urlData = formData.get("url");

	const UrlSchema = pipe(string(), url());
	const result = safeParse(UrlSchema, urlData);

	if (result.success) {
		const url = result.output;
		const client = hc<AppType>(context.cloudflare.env.BASE_URL);

		try {
			const response = await client.shorter.$post({
				json: {
					url: url,
					expirationDays: 7,
				},
			});
			const { shortUrl, expirationDate } = await response.json();
			return Response.json({ shortUrl, expirationDate }, { status: 201 });
		} catch (error) {
			return Response.json({ error: "短縮URL作成に失敗" }, { status: 500 });
		}
	}

	return Response.json(
		{
			error: "URLを入力してください",
		},
		{
			status: 400,
		},
	);
};

export default function Index() {
	const fetcher = useFetcher<ActionResponse>();

	const isLoading =
		fetcher.state === "loading" || fetcher.state === "submitting";

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
				<button type="submit" disabled={isLoading}>
					送信
				</button>
			</fetcher.Form>

			{fetcher.data?.error && (
				<p className="text-red-500">{fetcher.data.error}</p>
			)}
		</div>
	);
}
