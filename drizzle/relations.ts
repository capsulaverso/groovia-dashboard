import { relations } from "drizzle-orm/relations";
import { clients, users, agents, pages } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	client: one(clients, {
		fields: [users.clientId],
		references: [clients.id]
	}),
	pages_createdBy: many(pages, {
		relationName: "pages_createdBy_users_id"
	}),
	pages_updatedBy: many(pages, {
		relationName: "pages_updatedBy_users_id"
	}),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	users: many(users),
	agents: many(agents),
	pages: many(pages),
}));

export const agentsRelations = relations(agents, ({one}) => ({
	client: one(clients, {
		fields: [agents.clientId],
		references: [clients.id]
	}),
}));

export const pagesRelations = relations(pages, ({one}) => ({
	client: one(clients, {
		fields: [pages.clientId],
		references: [clients.id]
	}),
	user_createdBy: one(users, {
		fields: [pages.createdBy],
		references: [users.id],
		relationName: "pages_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [pages.updatedBy],
		references: [users.id],
		relationName: "pages_updatedBy_users_id"
	}),
}));