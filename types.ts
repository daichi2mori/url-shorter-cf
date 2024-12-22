export type Bindings = {
	DB: D1Database;
	URL_SHORTER: KVNamespace;
	BASE_URL: string;
	MY_VAR: string;
	API_KEY: string;
};

export type CreateUrlResponse = {
	shortUrl: string;
	expirationDate: string;
	ok: boolean;
};

export type ActionResponse = {
	expirationDate?: string;
	shortUrl?: string;
	error?: string;
};
