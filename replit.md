# Team Telecom Armenia eShop

## Overview
A modern e-commerce platform for Team Telecom Armenia, featuring smartphones, devices, accessories, and premium phone numbers. Built with React + Express + PostgreSQL.

## Architecture
- **Frontend:** React 19, Vite, Tailwind CSS v4, shadcn/ui, wouter (routing), TanStack Query
- **Backend:** Express.js, Drizzle ORM, PostgreSQL (Neon)
- **Shared:** TypeScript schemas in `shared/schema.ts`

## Project Structure
```
client/src/
  pages/         - Home, Product, Smartphones, Cart, Checkout
  components/    - UI components, PDP sections, Layout
  lib/           - Query client, image mapping, session management
server/
  index.ts       - Express server entry point
  routes.ts      - API routes (/api/products, /api/cart, /api/orders, etc.)
  storage.ts     - Database storage interface (Drizzle)
  db.ts          - Database connection
  seed.ts        - Database seeding
shared/
  schema.ts      - Drizzle tables + Zod schemas
```

## API Endpoints
- `GET /api/products` - List all products (optional `?category=smartphone`)
- `GET /api/products/:id` - Get product details
- `GET /api/numbers` - Featured phone numbers
- `POST /api/promo/validate` - Validate promo code
- `GET /api/cart` - Get cart items (session-based via x-session-id header)
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

## Database Tables
- `products` - Product catalog with specs, badges, gifts, colors, storage options
- `featured_numbers` - Premium phone numbers
- `promo_codes` - Promotional codes (XXXYYY = 5% off full payment)
- `orders` - Customer orders
- `cart_items` - Session-based shopping cart
- `users` - User accounts

## Key Features
- Product catalog with filtering, sorting, and search
- Credit calculator with multiple bank options
- Free gift selection on eligible products
- Session-based shopping cart with checkbox selection
- Featured phone numbers purchasable (Add to Cart / Buy Now) - stored as `number-{id}` productId
- Cart checkbox controls which items go to checkout (via sessionStorage `checkoutItemIds`)
- Promo code system (XXXYYY for 5% discount on full payment)
- Checkout with full payment and installment options
- Order submission with delivery/pickup options

## Cart & Checkout Flow
- Cart items use `x-session-id` header for session identification
- Numbers in cart use productId format `number-{id}` and are enriched with FeaturedNumber data
- Cart page stores selected item IDs in sessionStorage before navigating to checkout
- Checkout page reads and clears sessionStorage to filter items (null = show all)
- Checkout joins cart items with products/numbers data client-side

## Development
- Run: `npm run dev`
- DB Push: `npm run db:push`
- Server auto-seeds on first run
