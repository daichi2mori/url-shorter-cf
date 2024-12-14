import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const urls = sqliteTable(
	"urls",
	{
		id: text("id").primaryKey(),
		originalUrl: text("original_url").notNull(),
		expirationDate: text("expiration_date").notNull(),
		createdAt: text("created_at").notNull(),
	},
	() => [],
);
