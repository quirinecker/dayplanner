import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

export const event = sqliteTable('event', {
	id: int().primaryKey({ autoIncrement: true }),
    userid: text().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	from: text().notNull(),
	to: text().notNull(),
	created_at: text().notNull().default(new Date().toISOString()),
	updated_at: text().notNull().default(new Date().toISOString())
})
