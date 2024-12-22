import { tv } from "tailwind-variants";

export function SubmitButton({
	isLoading,
	isDisabled,
}: {
	isLoading: boolean;
	isDisabled: boolean;
}) {
	const submitButtonTv = tv({
		base: "cursor-pointer bg-[#7d7d7d] text-white h-11 md:h-12 md:w-[14%] px-5 rounded-r hover:opacity-80 duration-300",
		variants: {
			disable: {
				true: "text-neutral-400 cursor-not-allowed",
				false: "",
			},
		},
	});

	return (
		<button
			type="submit"
			disabled={isDisabled || isLoading}
			className={submitButtonTv({ disable: isDisabled || isLoading })}
		>
			短縮
		</button>
	);
}
