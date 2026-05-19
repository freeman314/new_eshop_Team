var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/vercel.ts
import express from "express";
import { createServer } from "http";

// server/storage.ts
import { eq, and } from "drizzle-orm";

// server/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cartItems: () => cartItems,
  featuredNumbers: () => featuredNumbers,
  insertCartItemSchema: () => insertCartItemSchema,
  insertFeaturedNumberSchema: () => insertFeaturedNumberSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertPromoCodeSchema: () => insertPromoCodeSchema,
  insertUserSchema: () => insertUserSchema,
  orders: () => orders,
  products: () => products,
  promoCodes: () => promoCodes,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var products = pgTable("products", {
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
  badges: jsonb("badges").$type().default([]),
  gift: jsonb("gift").$type(),
  discount: text("discount"),
  colors: jsonb("colors").$type().default([]),
  storage: jsonb("storage_options").$type().default([]),
  specs: jsonb("specs").$type().default({}),
  description: text("description")
});
var featuredNumbers = pgTable("featured_numbers", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  number: text("number").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  discount: integer("discount")
});
var promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent").notNull(),
  fullPaymentOnly: boolean("full_payment_only").notNull().default(false),
  active: boolean("active").notNull().default(true)
});
var orders = pgTable("orders", {
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
  items: jsonb("items").$type().notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  selectedStorage: text("selected_storage"),
  selectedGiftId: text("selected_gift_id")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertProductSchema = createInsertSchema(products).omit({ id: true });
var insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
var insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
var insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true });
var insertFeaturedNumberSchema = createInsertSchema(featuredNumbers).omit({ id: true });

// server/db.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var sql2 = neon(process.env.DATABASE_URL);
var db = drizzle(sql2, { schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getProducts(category) {
    if (category) {
      return db.select().from(products).where(eq(products.category, category));
    }
    return db.select().from(products);
  }
  async getProductById(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async getFeaturedNumbers() {
    return db.select().from(featuredNumbers);
  }
  async validatePromoCode(code) {
    const [promo] = await db.select().from(promoCodes).where(and(eq(promoCodes.code, code), eq(promoCodes.active, true)));
    return promo;
  }
  async createOrder(order) {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }
  async getOrderById(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async getCartItems(sessionId) {
    return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
  async addCartItem(item) {
    const existing = await db.select().from(cartItems).where(and(
      eq(cartItems.sessionId, item.sessionId),
      eq(cartItems.productId, item.productId)
    ));
    if (existing.length > 0) {
      const [updated] = await db.update(cartItems).set({ quantity: existing[0].quantity + (item.quantity || 1) }).where(eq(cartItems.id, existing[0].id)).returning();
      return updated;
    }
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }
  async updateCartItemQuantity(id, quantity) {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }
  async updateCartItem(id, updates) {
    const [updated] = await db.update(cartItems).set(updates).where(eq(cartItems.id, id)).returning();
    return updated;
  }
  async removeCartItem(id, sessionId) {
    await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
  }
  async clearCart(sessionId) {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(httpServer2, app2) {
  app2.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category;
      const products2 = await storage.getProducts(category);
      res.json(products2);
    } catch (error) {
      console.error("GET /api/products error:", error?.message, error?.stack);
      res.status(500).json({ message: "Failed to fetch products", error: error?.message });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.get("/api/numbers", async (_req, res) => {
    try {
      const numbers = await storage.getFeaturedNumbers();
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch numbers" });
    }
  });
  app2.post("/api/promo/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Promo code is required" });
      }
      const promo = await storage.validatePromoCode(code.toUpperCase());
      if (!promo) {
        return res.status(404).json({ message: "Invalid promo code" });
      }
      res.json(promo);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });
  app2.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const parsed = insertCartItemSchema.parse({
        ...req.body,
        sessionId
      });
      const item = await storage.addCartItem(parsed);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });
  app2.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity, selectedGiftId } = req.body;
      const updates = {};
      if (typeof quantity === "number" && quantity >= 1) {
        updates.quantity = quantity;
      }
      if (typeof selectedGiftId === "string") {
        updates.selectedGiftId = selectedGiftId;
      }
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const updated = await storage.updateCartItem(parseInt(req.params.id), updates);
      if (!updated) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.removeCartItem(parseInt(req.params.id), sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
  app2.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const parsed = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(parsed);
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  return httpServer2;
}
function getSessionId(req) {
  let sessionId = req.headers["x-session-id"];
  if (!sessionId) {
    sessionId = req.ip || "anonymous";
  }
  return sessionId;
}

// server/seed.ts
async function seedDatabase() {
  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }
  console.log("Seeding database...");
  await db.insert(products).values([
    {
      id: "honor-magic6-pro",
      name: "Honor Magic6 Pro",
      price: 212900,
      oldPrice: 236900,
      monthlyPrice: 4940,
      brand: "Honor",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "256GB",
      ram: "12GB",
      color: "Sage Green",
      sim: "Dual",
      rating: 48,
      reviews: 42,
      sku: "225175",
      inStock: true,
      isPreOrder: false,
      badges: [
        { text: "Credit 0%", color: "bg-purple-100 text-purple-700" },
        { text: "Free Gift", color: "bg-orange-100 text-orange-700" }
      ],
      gift: { name: "Wireless Buds Pro", imageKey: "wireless_earbuds", price: 25e3 },
      discount: "Save 24,000 \u058F",
      colors: [
        { name: "Sage Green", hex: "#8DA399", selected: true },
        { name: "Black", hex: "#1c1e21" },
        { name: "Cyan", hex: "#00bcd4" },
        { name: "Purple", hex: "#9c27b0" }
      ],
      storage: ["256GB", "512GB"],
      specs: {
        Memory: "256 GB",
        Brand: "Honor",
        Storage: "256 GB",
        Model: "Magic6 Pro",
        OS: "Android 14, MagicOS 8",
        Color: "Sage Green",
        "Display Size": '6.8", 1280x2800 pixels',
        "Main Camera": "50 MP + 180 MP + 50 MP",
        Network: "5G / 4G / 3G",
        "Front Camera": "50 MP",
        Battery: "5600 mAh",
        "Card Slots": "2 Nano SIMs",
        "Photo/Video": "4K@60fps, 1080p@240fps",
        Warranty: "24 months"
      },
      description: "Discover the magic of technology with the new Honor Magic6 Pro. Featuring a stunning display, powerful processor, and a revolutionary camera system, it redefines what a smartphone can do."
    },
    {
      id: "garmin-venu-3s",
      name: "Garmin Venu 3S",
      price: 185e3,
      monthlyPrice: 3850,
      brand: "Garmin",
      category: "device",
      imageKey: "garmin_venu_3s_watch",
      badges: [{ text: "Best Seller", color: "bg-blue-100 text-team-blue" }],
      isPreOrder: false,
      colors: [],
      storage: [],
      specs: {}
    },
    {
      id: "wireless-buds",
      name: "Wireless Buds Pro",
      price: 25e3,
      oldPrice: 35e3,
      monthlyPrice: 1200,
      brand: "Team",
      category: "accessory",
      imageKey: "wireless_earbuds",
      badges: [{ text: "New", color: "bg-blue-100 text-team-blue" }],
      discount: "Save 10,000 \u058F",
      isPreOrder: false,
      colors: [],
      storage: [],
      specs: {}
    },
    {
      id: "iphone-15",
      name: "iPhone 15",
      price: 385e3,
      monthlyPrice: 8900,
      brand: "Apple",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "128GB",
      ram: "6GB",
      color: "Black",
      sim: "eSIM",
      badges: [
        { text: "New", color: "bg-blue-100 text-team-blue" },
        { text: "Free Gift", color: "bg-orange-100 text-orange-700" }
      ],
      gift: { name: "Wireless Buds Pro", imageKey: "wireless_earbuds", price: 25e3 },
      isPreOrder: true,
      colors: [
        { name: "Black", hex: "#1c1e21", selected: true },
        { name: "Blue", hex: "#4169E1" },
        { name: "Pink", hex: "#FF69B4" }
      ],
      storage: ["128GB", "256GB"],
      specs: {
        Brand: "Apple",
        Model: "iPhone 15",
        OS: "iOS 17",
        "Display Size": '6.1", Super Retina XDR',
        "Main Camera": "48 MP + 12 MP",
        Network: "5G / 4G",
        Battery: "3349 mAh"
      }
    },
    {
      id: "samsung-s24",
      name: "Samsung Galaxy S24",
      price: 32e4,
      oldPrice: 35e4,
      monthlyPrice: 7400,
      brand: "Samsung",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "256GB",
      ram: "8GB",
      color: "Gray",
      sim: "Dual",
      badges: [{ text: "Sale", color: "bg-red-100 text-team-red" }],
      discount: "Save 30,000 \u058F",
      isPreOrder: false,
      colors: [
        { name: "Gray", hex: "#808080", selected: true },
        { name: "Violet", hex: "#8B5CF6" }
      ],
      storage: ["256GB"],
      specs: {
        Brand: "Samsung",
        Model: "Galaxy S24",
        OS: "Android 14, One UI 6",
        "Display Size": '6.2", Dynamic AMOLED',
        "Main Camera": "50 MP + 12 MP + 10 MP",
        Network: "5G / 4G",
        Battery: "4000 mAh"
      }
    },
    {
      id: "pixel-8",
      name: "Google Pixel 8",
      price: 29e4,
      monthlyPrice: 6700,
      brand: "Google",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "128GB",
      ram: "8GB",
      color: "Obsidian",
      sim: "eSIM",
      badges: [{ text: "Exclusive", color: "bg-yellow-100 text-yellow-700" }],
      isPreOrder: false,
      colors: [
        { name: "Obsidian", hex: "#333333", selected: true },
        { name: "Hazel", hex: "#8B7355" }
      ],
      storage: ["128GB", "256GB"],
      specs: {
        Brand: "Google",
        Model: "Pixel 8",
        OS: "Android 14",
        "Display Size": '6.2", OLED',
        "Main Camera": "50 MP + 12 MP",
        Network: "5G / 4G",
        Battery: "4575 mAh"
      }
    },
    {
      id: "xiaomi-14",
      name: "Xiaomi 14",
      price: 25e4,
      monthlyPrice: 5800,
      brand: "Xiaomi",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "512GB",
      ram: "12GB",
      color: "White",
      sim: "SIM",
      badges: [],
      isPreOrder: false,
      colors: [
        { name: "White", hex: "#FFFFFF", selected: true },
        { name: "Black", hex: "#1c1e21" }
      ],
      storage: ["256GB", "512GB"],
      specs: {
        Brand: "Xiaomi",
        Model: "Xiaomi 14",
        OS: "Android 14, MIUI 15",
        "Display Size": '6.36", AMOLED',
        "Main Camera": "50 MP + 50 MP + 50 MP",
        Network: "5G / 4G",
        Battery: "4610 mAh"
      }
    },
    {
      id: "iphone-15-pro",
      name: "iPhone 15 Pro",
      price: 54e4,
      monthlyPrice: 12500,
      brand: "Apple",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "256GB",
      ram: "8GB",
      color: "Titanium",
      sim: "eSIM",
      badges: [{ text: "Best Seller", color: "bg-blue-100 text-team-blue" }],
      isPreOrder: false,
      colors: [
        { name: "Natural Titanium", hex: "#C4B5A0", selected: true },
        { name: "Blue Titanium", hex: "#394E6A" },
        { name: "Black Titanium", hex: "#3A3A3C" }
      ],
      storage: ["256GB", "512GB", "1TB"],
      specs: {
        Brand: "Apple",
        Model: "iPhone 15 Pro",
        OS: "iOS 17",
        "Display Size": '6.1", Super Retina XDR ProMotion',
        "Main Camera": "48 MP + 12 MP + 12 MP",
        Network: "5G / 4G",
        Battery: "3274 mAh"
      }
    },
    {
      id: "samsung-a55",
      name: "Samsung Galaxy A55",
      price: 16e4,
      monthlyPrice: 3700,
      brand: "Samsung",
      category: "smartphone",
      imageKey: "honor_magic6_pro_green",
      memory: "128GB",
      ram: "8GB",
      color: "Blue",
      sim: "Dual",
      badges: [{ text: "Credit 0%", color: "bg-purple-100 text-purple-700" }],
      isPreOrder: false,
      colors: [
        { name: "Blue", hex: "#4169E1", selected: true },
        { name: "Lilac", hex: "#C8A2C8" }
      ],
      storage: ["128GB", "256GB"],
      specs: {
        Brand: "Samsung",
        Model: "Galaxy A55",
        OS: "Android 14, One UI 6",
        "Display Size": '6.6", Super AMOLED',
        "Main Camera": "50 MP + 12 MP + 5 MP",
        Network: "5G / 4G",
        Battery: "5000 mAh"
      }
    },
    {
      id: "ipad-air",
      name: "iPad Air 5",
      price: 28e4,
      monthlyPrice: 6500,
      brand: "Apple",
      category: "device",
      imageKey: "honor_magic6_pro_green",
      badges: [{ text: "Combo Offer", color: "bg-indigo-100 text-indigo-700" }],
      isPreOrder: false,
      colors: [],
      storage: [],
      specs: {}
    },
    {
      id: "sony-xm5",
      name: "Sony WH-1000XM5",
      price: 145e3,
      monthlyPrice: 3300,
      brand: "Sony",
      category: "accessory",
      imageKey: "wireless_earbuds",
      badges: [{ text: "Credit 0%", color: "bg-purple-100 text-purple-700" }],
      isPreOrder: false,
      colors: [],
      storage: [],
      specs: {}
    }
  ]);
  await db.insert(featuredNumbers).values([
    { type: "Platinum", number: "099 68 33 33", price: 112e3, oldPrice: 14e4, discount: 20 },
    { type: "Gold", number: "091 11 22 33", price: 8e4, oldPrice: 1e5, discount: 20 },
    { type: "Silver", number: "096 55 44 55", price: 4e4, oldPrice: 5e4, discount: 20 },
    { type: "Bronze", number: "033 99 88 77", price: 15e3, oldPrice: 2e4, discount: 25 },
    { type: "Platinum", number: "099 77 00 77", price: 112e3, oldPrice: 14e4, discount: 20 },
    { type: "Gold", number: "091 55 55 55", price: 85e3, oldPrice: 105e3, discount: 19 },
    { type: "Silver", number: "096 11 11 11", price: 45e3, oldPrice: 55e3, discount: 18 },
    { type: "Bronze", number: "033 22 22 22", price: 18e3, oldPrice: 22e3, discount: 18 }
  ]);
  await db.insert(promoCodes).values([
    { code: "XXXYYY", discountPercent: 5, fullPaymentOnly: true, active: true },
    { code: "WELCOME10", discountPercent: 10, fullPaymentOnly: false, active: true }
  ]);
  console.log("Database seeded successfully!");
}

// server/vercel.ts
var app = express();
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
var httpServer = createServer(app);
registerRoutes(httpServer, app);
seedDatabase().catch(console.error);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
var vercel_default = app;
export {
  vercel_default as default
};
