# Alpha Phi Alpha 120th Anniversary Commemorative Coin

## Overview
A premium e-commerce website for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin. The site features real-time inventory tracking and secure payment processing. The project aims to provide a luxurious online shopping experience for commemorative merchandise, emphasizing the fraternity's rich history and the limited-edition nature of the products.

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
- **Founders' Legacy Set Section:** Highlights "The Complete Collection" with specific pricing, founder images, and a CTA for the jewel set.
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
    - Database URL, Session Secret (Replit auto-configured)