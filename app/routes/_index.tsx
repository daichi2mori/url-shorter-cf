import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { ActionResponse, CreateUrlResponse } from "types";
import { url, pipe, safeParse, string } from "valibot";
import { createUrl } from "./db";

const UrlSchema = pipe(string(), url());

function formatDateToJapanese(dateString: string): string {
	const date = new Date(dateString);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}年${month}月${day}日`;
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const urlData = formData.get("url");

	const result = safeParse(UrlSchema, urlData);

	if (result.success) {
		const url = result.output;
		try {
			const response = await createUrl(url, 7, request.url, context);
			if (!response.ok) {
				return Response.json(
					{ error: "データベースとの通信に失敗しました" },
					{ status: response.status },
				);
			}

			const data: CreateUrlResponse = await response.json();

			return Response.json(
				{
					shortUrl: data.shortUrl,
					expirationDate: data.expirationDate,
				},
				{ status: 201 },
			);
		} catch (error) {
			console.error(error);
			return Response.json(
				{ error: "短縮URL作成に失敗しました" },
				{ status: 500 },
			);
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

	const [url, setUrl] = useState("");
	const [clientError, setClientError] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUrl(value);

		const result = safeParse(UrlSchema, value);

		if (!result.success) {
			setClientError("有効なURLを入力してください");
		} else {
			setClientError(null);
		}
	};

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			setUrl(""); // 入力を空にする
		}
	}, [fetcher.state, fetcher.data]);

	return (
		<div>
			<h1>Remix and Hono</h1>

			<fetcher.Form method="post">
				<input
					type="text"
					name="url"
					placeholder="短縮したいURLを入力"
					className="outline"
					value={url}
					onChange={handleInputChange}
				/>
				<button type="submit" disabled={isLoading || !!clientError}>
					送信
				</button>
			</fetcher.Form>

			<div>
				{fetcher.data?.shortUrl && <p>{fetcher.data.shortUrl}</p>}
				{fetcher.data?.expirationDate && (
					<p>有効期限：{formatDateToJapanese(fetcher.data.expirationDate)}</p>
				)}
			</div>

			{fetcher.data?.error && (
				<p className="text-red-500">{fetcher.data.error}</p>
			)}

			{clientError && <p className="text-red-500">{clientError}</p>}
		</div>
	);
}
