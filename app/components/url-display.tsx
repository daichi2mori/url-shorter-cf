import { useRef } from "react";
import { formatDateToJapanese } from "~/utils/utils";

export function UrlDisplay({
	originalUrl,
	shortUrl,
	expirationDate,
	setShowToast,
}: {
	originalUrl: string;
	shortUrl: string;
	expirationDate: string;
	setShowToast: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const copyRef = useRef<HTMLParagraphElement>(null);

	const handleCopyUrl = () => {
		if (!copyRef.current?.textContent) return;
		const url = copyRef.current.textContent;
		navigator.clipboard.writeText(url);
		setShowToast(true);
		setTimeout(() => {
			setShowToast(false);
		}, 2000);
	};

	return (
		<>
			<div className="bg-[#F8FAFC] mt-7 pt-4 px-4 pb-3 rounded md:flex md:items-center md:justify-between">
				<p className="text-xs md:text-base text-[#757575]">{originalUrl}</p>
				<div className="md:flex md:items-center">
					<div className="mr-8">
						<p className="text-base text-blue-500 mt-1" ref={copyRef}>
							{shortUrl}
						</p>
						<p className="mt-1">
							有効期限：{formatDateToJapanese(expirationDate)}
						</p>
					</div>
					<button
						type="button"
						onClick={handleCopyUrl}
						className="bg-[#A0C238] mt-2 text-white text-xs leading-7 text-center font-mono w-full rounded md:px-5 md:text-sm md:leading-8"
					>
						コピー
					</button>
				</div>
			</div>
		</>
	);
}
