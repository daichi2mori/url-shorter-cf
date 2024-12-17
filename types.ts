export type Bindings = {
	DB: D1Database;
	BASE_URL: string;
	MY_VAR: string;
};

export type ActionResponse = {
	expirationDate?: string;
	shortUrl?: string;
	error?: string;
};
