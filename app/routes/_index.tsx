import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import type { ActionResponse, CreateUrlResponse } from "types";
import { url, pipe, safeParse, string } from "valibot";
import { UrlForm } from "~/components/form";
import { UrlDisplay } from "~/components/url-display";
import { createUrl } from "../server/db";

const URL_SCHEMA = pipe(string(), url());
const GENERIC_ERROR_MESSAGE = "短縮URL作成に失敗しました";
const SUCCESS_STATUS = 201;
const ERROR_STATUS = 400;
const SERVER_ERROR_STATUS = 500;

export async function action({ context, request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const urlData = formData.get("url");

	const result = safeParse(URL_SCHEMA, urlData);

	if (!result.success) {
		return Response.json(
			{ shortUrl: "", expirationDate: "", error: "URLを入力してください" },
			{ status: ERROR_STATUS },
		);
	}

	const url = result.output;

	console.log(url);

	try {
		const response = await createUrl(url, 7, request.url, context);
		if (!response.ok) {
			return Response.json(
				{
					shortUrl: "",
					expirationDate: "",
					error: "データベースとの通信に失敗しました",
				},
				{ status: response.status },
			);
		}

		const data: CreateUrlResponse = await response.json();

		console.log(data);

		return Response.json(
			{
				shortUrl: data.shortUrl,
				expirationDate: data.expirationDate,
				error: "",
			},
			{ status: SUCCESS_STATUS },
		);
	} catch (error) {
		console.error(error);
		return Response.json(
			{ shortUrl: "", expirationDate: "", error: GENERIC_ERROR_MESSAGE },
			{ status: SERVER_ERROR_STATUS },
		);
	}
}

export default function Index() {
	const [originalUrl, setOriginalUrl] = useState("");
	const [showToast, setShowToast] = useState(false);
	const fetcher = useFetcher<ActionResponse>();

	return (
		<div className="container mx-auto pt-7 px-3 flex justify-center">
			<div className="max-w-[800px] w-full">
				<h1 className="text-[#A0C238] font-extrabold text-3xl md:text-5xl text-center tracking-wider mt-10">
					URL短縮サイト
				</h1>
				<UrlForm
					fetcher={fetcher}
					setOriginalUrl={setOriginalUrl}
					schema={URL_SCHEMA}
				/>

				{fetcher.data?.error && (
					<p className="text-red-500">{fetcher.data.error}</p>
				)}

				{fetcher.data && (
					<UrlDisplay
						originalUrl={originalUrl}
						shortUrl={fetcher.data.shortUrl}
						expirationDate={fetcher.data.expirationDate}
						setShowToast={setShowToast}
					/>
				)}
			</div>

			{showToast && (
				<div className="fixed top-8 right-1/2 translate-x-1/2 bg-neutral-600 text-white text-center w-1/2 py-3 rounded duration-300">
					<p>URLをコピーしました</p>
				</div>
			)}
		</div>
	);
}
