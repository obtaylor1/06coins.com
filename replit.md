# Alpha Phi Alpha 120th Anniversary Commemorative Coin

## Overview
This project is an e-commerce website for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin. It aims to provide a luxurious online shopping experience, featuring real-time inventory tracking and secure payment processing. The site emphasizes the fraternity's history and the limited-edition nature of the products, targeting deployment at **06coins.com**.

## User Preferences
- Dark mode only (Alpha Phi Alpha branding)
- Monumental, prestigious aesthetic
- Limited edition scarcity messaging
- Professional, heritage-focused tone

## System Architecture
The platform is designed with a premium luxury aesthetic, utilizing a Black (#121212) and Old Gold (#C8A856) color palette, museum-quality typography (Playfair Display for headings, Roboto for body), and Shadcn UI components for a responsive and refined user experience.

**Key Features:**
- **Premium Design Overhaul:** Dark theme with gold accents, serif typography, and refined messaging.
- **Dynamic Header:** Sticky header with a red background, Alpha Phi Alpha shield, real-time stock counter, and prominent CTA.
- **Enhanced Hero Section:** Split layout with content, coin image, "120th Anniversary Edition" badge, and trust indicators.
- **Founders' Legacy Set Section:** Highlights "The Complete Collection" with interactive founder images and a CTA.
- **Honor Your Favorite Jewel Carousel:** Interactive carousel for viewing and selecting individual "jewel" coins with founder details.
- **Luxury Product Showcase:** Displays coin renderings and specifications.
- **Timeline Story Section:** Vertical timeline narrating fraternity history.
- **Premium Why Own Section:** Three value propositions with subtle gold texture overlays.
- **Polished Purchase Module:** Includes trust signals, quantity selection with stock validation, and a premium checkout experience.
- **Comprehensive Admin Dashboard:** Protected `/admin` route with Replit Auth for managing analytics, inventory, customer details, and order tracking.
- **Complete Cart System with Museum-Quality Shop Page:** Premium museum aesthetic, full-width hero, and distinct product displays, with `localStorage` persistence and a sticky cart summary.
- **Payment Security:** Server-side price authority, payment verification, idempotency, and amount validation.
- **Inventory Management:** Initial stock of 1906 coins, real-time updates via Firebase Firestore or 5-second polling.
- **Google Analytics 4 Integration:** Comprehensive tracking of user behavior, e-commerce events, and conversion tracking, accessible via the admin dashboard.
- **Comprehensive SEO Optimization:** Dynamic meta tags, Open Graph tags, JSON-LD structured data, optimized images, SEO-rich content, XML sitemap, robots.txt, and canonical URLs.
- **Transactional Email System:** Multi-stage email flow (order confirmation, shipping, delivery, thank you, review, contact auto-reply) with luxury design and database tracking.
- **SMS Notification System (Twilio):** Order confirmation, shipping, delivery, thank you, and review SMS, along with admin alerts for new/high-value orders and issues. Includes compliance features like double opt-in, quiet hours, rate limiting, and automatic opt-out handling.

**Project Structure:**
- `client/`: React frontend.
- `server/`: Backend routes, storage, and Replit Auth.
- `db/`: Database initialization.
- `shared/`: Database schema definitions.

## External Dependencies
- **Frontend:** React, TypeScript, TanStack Query, Wouter, Tailwind CSS, Shadcn UI, Google Fonts (Playfair Display, Roboto), react-ga4.
- **Backend:** Express.js, PostgreSQL with Drizzle ORM, Replit Auth, Firebase Firestore, Stripe API, Nodemailer, Twilio API.
- **Database:** PostgreSQL.
- **Environment Variables:** Firebase API Key, App ID, Project ID, Stripe Public/Secret Keys, Google Analytics 4 Measurement ID, SMTP Configuration, Twilio SMS Configuration, Database URL, Session Secret.