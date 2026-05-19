import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  monthlyPrice: integer("monthly_price"),
  brand: text("brand").notNull(),
  category: text("category").notNull().default("smartphone"),
  imageKey: text("image_key").notNull(),
  memory: text("memory"),
  ram: text("ram"),
  color: text("color"),
  sim: text("sim"),
  rating: integer("rating"),
  reviews: integer("reviews"),
  sku: text("sku"),
  inStock: boolean("in_stock").notNull().default(true),
  isPreOrder: boolean("is_pre_order").notNull().default(false),
  badges: jsonb("badges").$type<{ text: string; color: string }[]>().default([]),
  gift: jsonb("gift").$type<{ name: string; imageKey: string; price: number } | null>(),
  discount: text("discount"),
  colors: jsonb("colors").$type<{ name: string; hex: string; selected?: boolean }[]>().default([]),
  storage: jsonb("storage_options").$type<string[]>().default([]),
  specs: jsonb("specs").$type<Record<string, string>>().default({}),
  description: text("description"),
});

export const featuredNumbers = pgTable("featured_numbers", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  number: text("number").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  discount: integer("discount"),
});

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent").notNull(),
  fullPaymentOnly: boolean("full_payment_only").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  deliveryMethod: text("delivery_method").notNull(),
  address: text("address"),
  region: text("region"),
  district: text("district"),
  store: text("store"),
  paymentType: text("payment_type").notNull(),
  paymentMethod: text("payment_method"),
  bank: text("bank"),
  promoCode: text("promo_code"),
  discountAmount: integer("discount_amount").default(0),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(),
  items: jsonb("items").$type<{ productId: string; name: string; quantity: number; price: number; gift?: string }[]>().notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  selectedStorage: text("selected_storage"),
  selectedGiftId: text("selected_gift_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true });
export const insertFeaturedNumberSchema = createInsertSchema(featuredNumbers).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type FeaturedNumber = typeof featuredNumbers.$inferSelect;
