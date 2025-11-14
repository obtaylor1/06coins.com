# Alpha Phi Alpha 120th Anniversary Commemorative Coin

## Overview
A premium e-commerce website for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin. The site features real-time inventory tracking with Firebase Firestore and secure payment processing through Stripe.

## Current Status
**Phase**: MVP Complete + Premium Design Overhaul ✓

### Completed Features
- ✅ **Premium Luxury Design System**
  - Black (#121212) & Old Gold (#C8A856) color palette
  - Museum-quality typography with Playfair Display & Roboto
  - Shadcn component variants throughout (no manual sizing)
  - Lucide-react icons (no emojis per guidelines)
  - Professional stock imagery integration (6 high-quality images)
  - Responsive design with refined spacing hierarchy
- ✅ **Redesigned Sticky Header** (Updated Nov 7, 2025)
  - Deep red background (#8B1538) matching fraternity colors
  - Actual Alpha Phi Alpha shield image (not generic icon)
  - Three-section layout: logo+title, stock counter, CTA button
  - Responsive design with proper spacing
  - Real-time stock counter with Firebase fallback to database polling
- ✅ **Enhanced Hero Section** (Updated Nov 7, 2025)
  - Split layout: content on left, coin image on right
  - "120th Anniversary Edition" badge positioned top-left
  - Main headline in gold with fraternity motto (left-bordered)
  - **LIMITED EDITION** text in bordered box with gold styling
  - Shopping cart icon on primary CTA button
  - Trust indicators line: "$50.00 Each", "Secure Checkout", "Authenticity Guaranteed"
  - Coin details badge anchored bottom-right of coin image
  - Real coin front image displayed
  - Responsive grid (single column mobile, two columns desktop)
- ✅ **Founders' Legacy Set Section** (Added Nov 14, 2025)
  - Positioned directly under hero section
  - "The Complete Collection" red badge
  - Gold headline: "The Founders' Legacy Set: Own All Seven Jewels"
  - Complete set pricing: $120.06 (commemorating 1906)
  - Seven circular founder images (Callis, Chapman, Jones, Kelley, Murray, Ogle, Tandy)
  - All seven actual commemorative coin images
  - "PURCHASE JEWEL SET" CTA button with scroll-to-purchase functionality
  - Museum-quality craftsmanship messaging
- ✅ **Honor Your Favorite Jewel Carousel Section** (Added Nov 14, 2025)
  - Positioned below story section
  - "Individual Pricing" badge with $19.06 each pricing
  - Interactive carousel with left/right arrow navigation
  - Center coin display with gold glow effect
  - Thumbnail navigation showing all seven jewels
  - Detailed founder information cards (full name, years, title, description)
  - Quantity selector (1-99) with increment/decrement controls
  - "Add Coin to Cart" functionality with toast notifications
  - "Collect All 7 Founder Coins" upsell banner with link to set purchase
  - Fully responsive design maintaining luxury aesthetic
  - All seven actual commemorative coin images (Callis, Chapman, Jones, Kelley, Murray, Ogle, Tandy)
- ✅ **Luxury Product Showcase**
  - Split-screen layout with actual coin renderings
  - Elegant coin specifications display
  - High-quality coin front & back images integrated
- ✅ **Timeline Story Section** (Updated Nov 7, 2025)
  - Vertical timeline with gold connecting line
  - Alternating left/right layout with icons
  - Year badges: 1906, 1906-2026, 2026
  - Icon circles on timeline (User, Users, ShieldCheck)
  - "Honor the Legacy - Add to Cart" as clickable gold button
- ✅ **Premium Why Own Section**
  - Three compelling value propositions
  - Hover effects with subtle gold texture overlays
  - Elegant card design with proper icon indicators
- ✅ **Polished Purchase Module**
  - Trust signals with professional icons (ShieldCheck, CreditCard, Package)
  - Quantity selector with stock validation
  - Premium checkout experience
  - Real coin front image displayed
  - "What's Included" checklist with 4 items
- ✅ **Comprehensive Admin Dashboard** (Updated Nov 7, 2025)
  - Protected /admin route with Replit Auth
  - **Analytics Dashboard**: Total revenue, profit, coins sold, remaining stock
  - **Inventory Management**: View stock, update levels, quick reset to 1906
  - **Customer & Shipping Management**: Full customer details, email, shipping addresses
  - **Order Tracking**: View all orders with payment details, status, and timestamps
  - **Stripe Integration**: Payment intent IDs, transaction verification
  - Role-based access control (isAdmin flag in database)
  - Secure API endpoints with auth middleware
- ✅ **Comprehensive Payment Security**
  - Server-side price authority (COIN_PRICE = $50)
  - Payment verification before inventory changes
  - Idempotency to prevent duplicate orders
  - Amount validation (prevents underpayment attacks)
- ✅ **Database & Infrastructure**
  - PostgreSQL with Drizzle ORM for inventory and orders
  - Complete Stripe checkout flow (creates orders, decrements inventory)
  - Firebase Firestore integration ready (awaiting credentials)
  - SEO optimization with meta tags

### Next Features
- Waitlist email collection system
- Order confirmation emails
- 3D coin viewer
- Customer account system

## Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- Wouter for routing
- Tailwind CSS for styling
- Shadcn UI components
- Google Fonts: Playfair Display (headings) + Roboto (body)

### Backend
- Express.js
- PostgreSQL with Drizzle ORM
- Replit Auth (admin authentication)
- Firebase Firestore (real-time inventory)
- Stripe API (payment processing)

## Design System

### Colors
- **Primary Gold**: `hsl(42 48% 56%)` - #C8A856
- **Background Dark**: `hsl(0 0% 7%)` - #121212
- **Foreground**: `hsl(0 0% 96%)` - Near white
- **Destructive (Sold Out)**: `hsl(0 72% 50%)` - Red

### Typography
- **Headings**: Playfair Display (serif) with letter-spacing: 0.05em for "monumental" feel
- **Body**: Roboto (sans-serif)
- **Hero Title**: 5xl-8xl responsive
- **Section Headers**: 4xl-6xl

### Key Components
- `StickyHeader`: Always-visible header with stock counter and CTA
- `HeroSection`: Full-screen hero with motto, title, coin render, and primary CTA
- `StorySection`: 3-column grid explaining fraternity history
- `ProductShowcase`: Detailed coin specifications and imagery
- `WhyOwnSection`: 3-card layout with purchase motivations
- `PurchaseModule`: Checkout interface with quantity selector

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── sticky-header.tsx
│   │   ├── hero-section.tsx
│   │   ├── story-section.tsx
│   │   ├── product-showcase.tsx
│   │   ├── why-own-section.tsx
│   │   └── purchase-module.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── admin.tsx
│   │   ├── checkout.tsx
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts
├── storage.ts
├── replitAuth.ts
└── vite.ts
db/
└── index.ts
shared/
└── schema.ts
```

## Environment Variables Required

### Firebase (Real-time Inventory)
**Client-side (for real-time listeners):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_PROJECT_ID`

**Server-side (for Firestore sync):**
- `FIREBASE_PROJECT_ID` (can be same as VITE_FIREBASE_PROJECT_ID without the VITE_ prefix)

### Stripe (Payment Processing)
- `VITE_STRIPE_PUBLIC_KEY` (frontend)
- `STRIPE_SECRET_KEY` (backend)

### Database (PostgreSQL)
- `DATABASE_URL` (auto-configured by Replit)
- `SESSION_SECRET` (auto-configured by Replit)

## Firebase Setup Instructions

Once you provide Firebase credentials, follow these steps:

1. **Firestore Database Rules** (in Firebase Console):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /coin_inventory/{document} {
         allow read: if request.auth != null;  // Allow authenticated users (including anonymous)
         allow write: if false;  // Server-only writes
       }
     }
   }
   ```

2. **Initialize Stock Document** (in Firestore Console):
   - Collection: `coin_inventory`
   - Document ID: `apa120th_coin_stock`
   - Fields:
     - `remaining_stock` (number): 406
     - `last_updated` (timestamp): auto

3. **For Production** (server-side):
   - Add Firebase service account JSON
   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable

## Security Architecture

### Payment Security (Critical)
1. **Server-Side Price Authority**
   - COIN_PRICE constant defined server-side only
   - Client sends quantity, server calculates amount
   - Prevents client-side price manipulation

2. **Payment Verification**
   - `/api/inventory/decrement` verifies Stripe payment before inventory changes
   - Validates both quantity AND amount match payment intent
   - Idempotency check prevents duplicate orders
   - Order created atomically with inventory decrement

3. **Admin Protection**
   - All admin endpoints require `isAuthenticated` + `isAdmin` middleware
   - `/api/admin/inventory` - Update stock (admin only)
   - `/api/admin/orders` - View all orders (admin only)

### Database Schema
- **users**: id, email, firstName, lastName, profileImageUrl, isAdmin, createdAt, updatedAt
- **sessions**: Passport session storage for Replit Auth
- **inventory**: id, productName, remainingStock, initialStock, lastUpdated
- **orders**: id, stripePaymentIntentId, quantity, totalAmount, status, customerName, customerEmail, shippingAddress (JSONB), createdAt

## Inventory Configuration

**Starting Stock:** 1906 coins (commemorating Alpha Phi Alpha's 1906 founding year)
- Database initialized with 1906 remaining stock
- All fallback values set to 1906
- Stock decrements with each purchase
- Real-time updates via Firebase or 5-second polling fallback

## Admin Portal Access

**URL**: `/admin` (e.g., `https://your-app.replit.app/admin`)

**Authentication**:
1. Click "Login with Replit" when accessing /admin
2. After first login, user account is created automatically
3. **To grant admin access**:
   - Access the database directly (Database pane in Replit)
   - Update the `users` table: Set `is_admin = 1` for your user account
   - Logout and login again to activate admin privileges

**Admin Capabilities**:
- View real-time analytics (revenue, profit, coins sold, stock remaining)
- Update inventory levels or reset to 1906 coins
- View all customer orders with shipping information
- Track Stripe payment transactions
- Monitor sales performance

## Testing Checklist

Current state:
- ✅ Inventory persists in PostgreSQL database (starting at 1906)
- ✅ Stock counter shows 1906 on frontend (polling every 5 seconds)
- ✅ Checkout flow with server-side price calculation
- ✅ Payment verification before inventory decrement
- ✅ Orders recorded with customer/shipping information
- ✅ Admin dashboard with analytics and customer management
- ✅ Admin dashboard protected with Replit Auth
- ✅ Sold-out state works correctly

With Firebase (once credentials added):
- Real-time stock updates across all browsers
- Inventory syncs to Firestore on every change

## User Preferences
- Dark mode only (Alpha Phi Alpha branding)
- Monumental, prestigious aesthetic
- Limited edition scarcity messaging
- Professional, heritage-focused tone
