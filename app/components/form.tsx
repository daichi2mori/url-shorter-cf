import type { FetcherWithComponents } from "@remix-run/react";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";
import type { ActionResponse } from "types";
import {
	type SchemaWithPipe,
	type StringSchema,
	type UrlAction,
	safeParse,
} from "valibot";
import { SubmitButton } from "./button";

export function UrlForm({
	fetcher,
	setOriginalUrl,
	schema,
}: {
	fetcher: FetcherWithComponents<ActionResponse>;
	setOriginalUrl: (url: string) => void;
	schema: SchemaWithPipe<
		[StringSchema<undefined>, UrlAction<string, undefined>]
	>;
}) {
	const isLoading =
		fetcher.state === "loading" || fetcher.state === "submitting";
	const [inputField, setInputField] = useState("");
	const [urlError, setUrlError] = useState(true);

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		setInputField(value);

		const result = safeParse(schema, value);

		if (!result.success) {
			setUrlError(true);
		} else {
			setUrlError(false);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			setOriginalUrl(inputField);
			setInputField("");
			setUrlError(true);
		}
	}, [fetcher.state, fetcher.data]);

	const inputTv = tv({
		base: "bg-[#F8FAFC] h-11 md:h-12 text-base px-3.5 rounded-l outline-none grow",
		variants: {
			color: {
				black: "",
				red: "text-red-500",
			},
		},
	});

	return (
		<fetcher.Form
			method="post"
			className="max-w-[800px] flex items-center mt-10"
		>
			<input
				type="text"
				name="url"
				placeholder="短縮したいURLを入力"
				className={inputTv({ color: urlError ? "red" : "black" })}
				value={inputField}
				onChange={handleInputChange}
			/>
			<SubmitButton isLoading={isLoading} isDisabled={urlError} />
		</fetcher.Form>
	);
}
