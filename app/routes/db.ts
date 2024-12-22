import type { AppLoadContext } from "@remix-run/cloudflare";
import { urls } from "db/schema";
import { drizzle } from "drizzle-orm/d1";
import { nanoid } from "nanoid";
import { calculateJSTExpirationISO, generateJSTISOTime } from "server/utils";
import type { CreateUrlResponse } from "types";

export async function createUrl(
	url: string,
	expirationDays: number,
	baseUrl: string,
	context: AppLoadContext,
) {
	const id = nanoid(8);
	const expirationDate = calculateJSTExpirationISO(expirationDays);

	const db = drizzle(context.cloudflare.env.DB);

	try {
		const result = await db
			.insert(urls)
			.values({
				id: id,
				originalUrl: url,
				expirationDate: expirationDate,
				createdAt: generateJSTISOTime().toISOString(),
			})
			.returning({ id: urls.id })
			.get();

		const shortUrl = `${baseUrl}${result.id}`;

		await context.cloudflare.env.URL_SHORTER.put(id, url);

		const body: CreateUrlResponse = { shortUrl, expirationDate, ok: true };

		return Response.json(body, { status: 201 });
	} catch (e) {
		console.error(e);
		const body: CreateUrlResponse = {
			shortUrl: "",
			expirationDate: "",
			ok: false,
		};
		return Response.json(body, { status: 500 });
	}
}
