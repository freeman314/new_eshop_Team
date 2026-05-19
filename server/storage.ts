import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, products, featuredNumbers, promoCodes, orders, cartItems,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type CartItem, type InsertCartItem,
  type PromoCode, type FeaturedNumber,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(category?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;

  getFeaturedNumbers(): Promise<FeaturedNumber[]>;

  validatePromoCode(code: string): Promise<PromoCode | undefined>;

  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;

  getCartItems(sessionId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  updateCartItem(id: number, updates: Partial<Pick<CartItem, 'quantity' | 'selectedGiftId'>>): Promise<CartItem | undefined>;
  removeCartItem(id: number, sessionId: string): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(category?: string): Promise<Product[]> {
    if (category) {
      return db.select().from(products).where(eq(products.category, category));
    }
    return db.select().from(products);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getFeaturedNumbers(): Promise<FeaturedNumber[]> {
    return db.select().from(featuredNumbers);
  }

  async validatePromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes)
      .where(and(eq(promoCodes.code, code), eq(promoCodes.active, true)));
    return promo;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order as any).returning();
    return created;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const existing = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.sessionId, item.sessionId),
        eq(cartItems.productId, item.productId),
      ));

    if (existing.length > 0) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing[0].quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async updateCartItem(id: number, updates: Partial<Pick<CartItem, 'quantity' | 'selectedGiftId'>>): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeCartItem(id: number, sessionId: string): Promise<void> {
    await db.delete(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
