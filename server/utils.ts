const jstOffset = 9 * 60 * 60 * 1000; // JST のオフセット（+9時間）

export function generateJSTISOTime(): Date {
	const now = new Date();
	const jstNow = new Date(now.getTime() + jstOffset);
	return jstNow;
}

export function calculateJSTExpirationISO(days: number): string {
	const now = new Date();

	// JST の現在の日付に days 日追加
	now.setDate(now.getDate() + days);

	// 最終時刻（23:59:59.999）を設定
	now.setHours(23, 59, 59, 999);

	const expirationDate = new Date(now.getTime() + jstOffset).toISOString();

	return expirationDate;
}

export function isPastDate(expirationDate: string): boolean {
	// stringで保存された有効期限をDateに変換
	const expiration = new Date(expirationDate);
	const expirationDateOnly = new Date(
		expiration.getFullYear(),
		expiration.getMonth(),
		expiration.getDate(),
	);

	const jstNow = generateJSTISOTime();
	const jstNowDateOnly = new Date(
		jstNow.getFullYear(),
		jstNow.getMonth(),
		jstNow.getDate(),
	);

	return expirationDateOnly < jstNowDateOnly;
}
