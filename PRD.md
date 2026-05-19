# Product Requirements Document (PRD)
## Team Telecom Armenia eShop Platform

### 1. Executive Summary
**Project Name:** Team Telecom Armenia eShop Mockup
**Goal:** Create a modern, high-converting, and user-friendly e-commerce frontend prototype for Team Telecom Armenia. The platform supports browsing and purchasing telecommunication products (smartphones, devices, accessories) and services (numbers) with seamless integration of credit/installment options and promotional gifts.

### 2. Target Audience
- Existing and prospective Team Telecom Armenia customers.
- Users looking to purchase smartphones, tech accessories, and smart devices.
- Customers seeking flexible payment options, including monthly installments and 0% credit lines (e.g., Rocket Line).

### 3. Key Pages & Features

#### 3.1 Global Elements (Layout)
- **Header:** 
  - Brand Logo (Team Telecom).
  - Main Navigation: Smartphones, Numbers, Devices, Accessories.
  - Utilities: Global Search, Language Selector (AM, EN, RU), User Profile, Shopping Cart (with item count badge).
- **Footer:** Standard corporate links, trust marks, support contacts, and social media links.

#### 3.2 Home Page
- **Hero Carousel:** Promotional banners highlighting current campaigns.
- **Quick Links/Categories:** Easy access to core product categories.
- **Featured Products:** Horizontal scrolling list or grid of top-selling or discounted items.
- **Promotional Blocks:** Highlights for special telecom tariffs or internet plans bundled with devices.

#### 3.3 Product Listing Page (PLP) - e.g., Smartphones
- **Grid View:** Clean, modern card-based layout for products.
- **Filtering & Sorting:** Filters by Brand, Price Range, Specifications (RAM, Storage). Sorting by Newest, Price, Popularity.
- **Product Cards:** Display product image, name, base price, monthly installment price, color options, and quick action buttons (Favorite, Compare, Add to Cart).

#### 3.4 Product Details Page (PDP)
- **Breadcrumbs:** Clear path navigation (e.g., Home > Smartphones > Honor > Honor Magic6 Pro).
- **Media Gallery:** Main image view with thumbnails, background styling, and placeholder controls for 3D View and Zoom.
- **Product Information:** Name, SKU with quick-copy, Stock status, Rating, and Review count.
- **Configuration:** 
  - Color selector (with visual swatches).
  - Storage selector (e.g., 256GB, 512GB) with dynamic price updating.
- **Free Gift Selection Flow:** 
  - Dynamic "Free Gift" module opening a modal.
  - Users can choose from available gifts (e.g., Wireless Buds, 20W Adapter, Silicone Case).
- **Credit Calculator:**
  - Interactive slider for choosing installment duration (3 to 48 months).
  - Bank selection dropdown (Inecobank, ACBA, Ameriabank, Evocabank, Rocket Line).
  - Dynamic calculation of monthly payments, interest rates, and total payable amounts.
- **Call-to-Action (Split Buttons):**
  - **Add to Cart:** Adds item to cart and shows a success toast notification.
  - **Buy Now:** Bypasses standard cart flow and routes directly to Checkout.
- **Sticky Buy Bar:** Appears on scroll, containing product summary, price, and CTA buttons to ensure persistent conversion opportunities.
- **Offers & Benefits:** Highlight bundles and special financial terms (e.g., "More Profitable Together" modal).
- **Tabs:** Description and detailed Specifications.
- **Cross-Selling:** "Essential Accessories" section below main product details.

#### 3.5 Shopping Cart
- **Item List:** Displays added products with thumbnail, selected color/storage, price, and quantity toggles.
- **Item Selection:** 
  - Checkboxes to select/deselect specific items for purchase.
  - "Select All" functionality.
  - Items explicitly paired with gifts show the gift as a non-removable sub-item.
- **Dynamic Summary:** Order total recalculates instantly based on selected items and quantities.
- **Validation:** "Proceed to Checkout" button is disabled if no items are selected.

#### 3.6 Checkout Flow
- **Delivery Information:**
  - Method selection: Standard Delivery, Express Delivery, Store Pickup.
  - Contact Details form: Name, Phone Number, Email, Address.
- **Promo Code System:**
  - Input field for promotional codes (e.g., "XXXYYY").
  - Dynamically applies discounts (e.g., 5% off) specifically based on business rules (e.g., valid only for full payment, not installments).
- **Payment Options:**
  - **Full Payment:** Tab for outright purchase. Options include Bank Card, Idram, My Ameria, Telcell.
  - **Installments (Credit):** Tab for financing. Options include major Armenian banks (Inecobank, ACBA, Ameriabank, Evocabank, Unibank, Converse Bank).
- **Dynamic Payment CTA:**
  - The final action button updates text contextually (e.g., "Pay 212,900 ֏" for card, "Pay via Idram" for e-wallet, "Apply for Installment" for bank credit).
- **Order Summary:** Read-only breakdown of items, subtotal, shipping cost, discounts, and final total.

### 4. Design & UX Guidelines
- **Color Palette:** Team Telecom corporate colors (Team Red, Team Blue, supporting grays and whites for clean background).
- **Typography:** Modern, legible sans-serif stack ensuring readability on mobile and desktop.
- **Micro-interactions:** 
  - Active hover states on cards.
  - Smooth transitions on accordions and modals.
  - Interactive credit slider.
- **Responsiveness:** Fully fluid design adapting to mobile, tablet, and desktop viewports.

### 5. Technical Constraints (Mockup Scope)
- **Frontend Only:** Built with React, Vite, Tailwind CSS, and shadcn/ui.
- **Routing:** Handled client-side via `wouter`.
- **Data Persistence:** In-memory state only (no actual database or backend integration).
- **No Live Transactions:** Payment gateways and bank installment APIs are visually simulated.

### 6. Future Enhancements (Out of current scope)
- Full user authentication and order history.
- Live inventory tracking.
- Integration with actual banking APIs for live credit scoring.
- Payment gateway integration (ArCa, Stripe, etc.).