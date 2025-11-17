# Alpha Phi Alpha 120th Anniversary Commemorative Coin

## Overview
A premium e-commerce website for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin. The site features real-time inventory tracking and secure payment processing. The project aims to provide a luxurious online shopping experience for commemorative merchandise, emphasizing the fraternity's rich history and the limited-edition nature of the products.

**Deployment:** The site will be deployed at **06coins.com**

## User Preferences
- Dark mode only (Alpha Phi Alpha branding)
- Monumental, prestigious aesthetic
- Limited edition scarcity messaging
- Professional, heritage-focused tone

## System Architecture
The platform is built with a premium luxury design system featuring a Black (#121212) and Old Gold (#C8A856) color palette, museum-quality typography (Playfair Display for headings, Roboto for body), and Shadcn UI components. The UI/UX emphasizes a responsive design with refined spacing and professional imagery.

**Key Features:**
- **Premium Design Overhaul:** Utilizes a dark theme with gold accents, serif typography for headings, and refined messaging across all product descriptions and site elements.
- **Dynamic Header:** A sticky header with a bright red background (using destructive theme color matching "The Complete Collection" badge), featuring the Alpha Phi Alpha shield, a real-time stock counter, and a prominent CTA button.
- **Enhanced Hero Section:** Features a split layout with content on the left and a coin image on the right, including a "120th Anniversary Edition" badge, gold headlines, and trust indicators.
- **Founders' Legacy Set Section:** Highlights "The Complete Collection" with specific pricing, founder images with interactive hover zoom effect (1.5x scale on desktop, 1.3x on mobile with gold glow), and a CTA for the jewel set.
- **Honor Your Favorite Jewel Carousel:** An interactive carousel allowing users to view and select individual "jewel" coins, featuring detailed founder information and quantity selection.
- **Luxury Product Showcase:** Displays actual coin renderings and elegant specifications.
- **Timeline Story Section:** A vertical timeline narrating the fraternity's history, encouraging engagement and purchase.
- **Premium Why Own Section:** Three value propositions with subtle gold texture overlays on hover.
- **Polished Purchase Module:** Includes trust signals, quantity selection with stock validation, and a premium checkout experience.
- **Comprehensive Admin Dashboard:** A protected `/admin` route with Replit Auth for managing analytics (revenue, profit, coins sold, stock), inventory, customer details, and order tracking.
- **Complete Cart System with Museum-Quality Shop Page:** Features a premium museum aesthetic with gold and black themes, full-width hero, decorative elements, and distinct product displays (main coin, jewel set, individual jewels via carousel). The cart system uses `CartContext` with `localStorage` persistence, a mini-cart icon, and a sticky cart summary.
- **Payment Security:** Implements server-side price authority, payment verification before inventory changes, idempotency to prevent duplicate orders, and amount validation.
- **Inventory Management:** Initial stock of 1906 coins, decremented with each purchase, with real-time updates via Firebase Firestore or a 5-second polling fallback.
- **Admin Access:** Requires Replit Auth, with an `isAdmin` flag in the database for role-based access control.
- **Google Analytics 4 Integration:** Comprehensive tracking of user behavior, page views, e-commerce events (add to cart, purchases), and conversion tracking. Integrated into the admin dashboard for easy access to analytics console.

**Project Structure:**
- `client/`: Houses the React frontend components, contexts, hooks, libraries, and pages.
- `server/`: Contains backend routes, storage, Replit Auth integration, and Vite configuration.
- `db/`: Database initialization.
- `shared/`: Defines the database schema.

## External Dependencies
- **Frontend:**
    - React with TypeScript
    - TanStack Query (data fetching)
    - Wouter (routing)
    - Tailwind CSS (styling)
    - Shadcn UI (components)
    - Google Fonts (Playfair Display, Roboto)
    - react-ga4 (Google Analytics 4 integration)
- **Backend:**
    - Express.js
    - PostgreSQL with Drizzle ORM
    - Replit Auth (admin authentication)
    - Firebase Firestore (real-time inventory)
    - Stripe API (payment processing)
- **Database:**
    - PostgreSQL
- **Environment Variables:**
    - Firebase API Key, App ID, Project ID (client and server)
    - Stripe Public Key (frontend), Secret Key (backend)
    - Google Analytics 4 Measurement ID (optional, for tracking)
    - Database URL, Session Secret (Replit auto-configured)

## Google Analytics 4 Setup

The application includes comprehensive Google Analytics 4 tracking for monitoring user behavior, conversions, and e-commerce events.

### How to Enable GA4 Tracking

1. **Create a Google Analytics 4 Property:**
   - Go to [https://analytics.google.com](https://analytics.google.com)
   - Create a new account or use an existing one
   - Create a new GA4 property
   - Copy your Measurement ID (format: `G-XXXXXXXXX`)

2. **Add the Measurement ID to Environment Variables:**
   - In Replit Secrets, add a new secret:
     - Key: `VITE_GA4_MEASUREMENT_ID`
     - Value: Your GA4 Measurement ID (e.g., `G-XXXXXXXXX`)
   - The app will automatically initialize GA4 tracking once this is configured

3. **Verify Tracking:**
   - Navigate to the `/admin` dashboard
   - Check the "Google Analytics Tracking" section
   - Status should show "GA4 Active" with your Measurement ID
   - Click "Open Google Analytics Console" to view real-time data

### Technical Implementation

The GA4 integration uses a React Context pattern (`AnalyticsProvider` in `client/src/contexts/analytics-context.tsx`) to manage initialization state reactively. This ensures:
- The admin dashboard shows accurate real-time status (Active/Failed/Not Configured)
- All tracking calls are properly gated behind initialization checks
- PII data is automatically sanitized in e-commerce events
- Components can subscribe to analytics state changes via the `useAnalytics()` hook

### Tracked Events

The application automatically tracks the following events:

**Page Views:**
- All route changes (home, shop, checkout, admin)
- Automatically captured with page titles

**E-commerce Events:**
- `add_to_cart`: When users add items to their cart (includes item ID, name, price, quantity)
- `view_item`: When users view product details
- `purchase`: When orders are successfully completed (includes transaction ID, total value, item details)

**Enhanced E-commerce Data:**
- Transaction IDs (Stripe Payment Intent IDs)
- Revenue tracking (in USD)
- Product-level data (item names, IDs, prices, quantities)
- Currency information

### Accessing Analytics

**From the Admin Dashboard:**
1. Log in to `/admin` with Replit Auth
2. Scroll to the "Google Analytics Tracking" section
3. Click "Open Google Analytics Console" to access the full GA4 dashboard

**Directly in Google Analytics:**
- Reports → Realtime: View current active users and events
- Reports → Engagement: View page views and user engagement
- Reports → Monetization: View e-commerce data and purchases
- Reports → Conversions: Track purchase completions and conversion rates