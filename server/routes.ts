import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCartItemSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const products = await storage.getProducts(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
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

  app.get("/api/numbers", async (_req, res) => {
    try {
      const numbers = await storage.getFeaturedNumbers();
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch numbers" });
    }
  });

  app.post("/api/promo/validate", async (req, res) => {
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

  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const parsed = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
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

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity, selectedGiftId } = req.body;
      const updates: Record<string, any> = {};
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

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.removeCartItem(parseInt(req.params.id), sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  app.post("/api/orders", async (req, res) => {
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

  app.get("/api/orders/:id", async (req, res) => {
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

  return httpServer;
}

function getSessionId(req: any): string {
  let sessionId = req.headers["x-session-id"] as string;
  if (!sessionId) {
    sessionId = req.ip || "anonymous";
  }
  return sessionId;
}
