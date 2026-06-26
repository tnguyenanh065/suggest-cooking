import { pgTable, text, boolean, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dishesTable = pgTable("dishes", {
  id: serial("id").primaryKey(),
  stt: integer("stt").notNull(),
  ten: text("ten").notNull(),
  thit: text("thit").notNull(),
  canTrung: boolean("can_trung").notNull().default(false),
  canRauCu: boolean("can_rau_cu").notNull().default(false),
  canBot: boolean("can_bot").notNull().default(false),
  canSua: boolean("can_sua").notNull().default(false),
  canGiVi: boolean("can_gi_vi").notNull().default(false),
  thoiGian: text("thoi_gian").notNull(),
  khongNenAn: text("khong_nen_an").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDishSchema = createInsertSchema(dishesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDish = z.infer<typeof insertDishSchema>;
export type Dish = typeof dishesTable.$inferSelect;
