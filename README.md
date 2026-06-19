# Alpha Phi Alpha 120th Anniversary Commemorative Coin

A premium e-commerce platform for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin collection.

**Live Site:** [06coins.com](https://06coins.com)

## Overview

This platform delivers a luxurious online shopping experience featuring real-time inventory tracking, secure payment processing, and comprehensive communication systems. The site emphasizes the fraternity's rich history and the limited-edition nature of the commemorative coin products.

## Products

- **Main Commemorative Coin (4")**: $39.06 — Limited to 1,906 units
- **Founders' Jewel Coins (3")**: $19.06 each — Individual 3-inch coins honoring each founder
- **Complete Founders' Set (7 coins)**: $120.06 — The full collection

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Shadcn UI |
| Routing | Wouter |
| State & Data | TanStack Query (React Query) |
| Backend | Express.js, Node.js |
| Database | PostgreSQL with Drizzle ORM |
| Real-time | Firebase Firestore |
| Payments | Stripe (Checkout + PaymentIntents) |
| Analytics | Google Analytics 4 |
| Email | Nodemailer (SMTP) |
| SMS | Twilio API |
| Auth | Replit Auth |

## Key Features

- **Premium Dark/Luxury Design**: Black (#121212) and Old Gold (#C8A856) palette with museum-quality typography
- **Real-time Inventory**: Firebase Firestore updates with 5-second polling fallback
- **Secure Payments**: Server-side price authority, Stripe checkout, payment verification
- **Comprehensive Admin Dashboard**: Protected `/admin` route with analytics, inventory, orders, and customer management
- **Cart System**: Full cart with localStorage persistence, sticky summary, and museum-quality shop page
- **Transactional Emails**: Order confirmation, shipping, delivery, thank you, and review request flows
- **SMS Notifications**: Order updates and admin alerts via Twilio with compliance features
- **SEO Optimization**: Dynamic meta tags, Open Graph, JSON-LD structured data, sitemap, robots.txt
- **GA4 Integration**: Full e-commerce event tracking and conversion analytics

## Environment Variables

The following environment variables are required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session encryption key |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_PROJECT_ID` | Firebase Project ID (server) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `VITE_GA4_MEASUREMENT_ID` | Google Analytics 4 ID |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email SMTP configuration |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio sending phone number |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run db:push  # Push database schema changes
```

## Project Structure

```
client/          # React frontend
  src/
    components/  # UI components
    pages/       # Route pages
    lib/         # Utilities, hooks, and configurations
    hooks/       # Custom React hooks
    types/       # TypeScript types
server/          # Express backend
  routes.ts      # API routes
  storage.ts     # Storage interface
  services/      # Email, SMS, Firebase services
shared/          # Database schema definitions
  schema.ts      # Drizzle ORM schema
attached_assets/ # Product images and founder portraits
```

## License

MIT
