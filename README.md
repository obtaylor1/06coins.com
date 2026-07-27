# Alpha Phi Alpha 120th Anniversary Commemorative Coin

A premium e-commerce platform for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin collection.

**Live Site:** [06coins.com](https://06coins.com)

## Overview

This platform delivers a luxurious online shopping experience featuring real-time inventory tracking, secure payment processing, and comprehensive communication systems. The site emphasizes the fraternity's rich history and the limited-edition nature of the commemorative coin products.

## Products

- **Main Commemorative Coin (4")**: $59.06 — Limited to 1,906 units
- **Founders' Jewel Coins (3")**: $19.06 each — Individual 3-inch coins honoring each founder
- **Complete Founders' Set (7 coins)**: $159.06 — The full collection
- **Coin + Founders Set Bundle**: 30% off each matched pair

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Shadcn UI |
| Routing | Wouter |
| State & Data | TanStack Query (React Query) |
| Backend | Express.js, Node.js |
| Database | MySQL/MariaDB with Drizzle ORM |
| Inventory | Transaction-safe MySQL updates with lightweight API refreshes |
| Payments | Stripe (Checkout + PaymentIntents) |
| Analytics | Google Analytics 4 |
| Email | Nodemailer (SMTP) |
| Auth | Password login with MySQL-backed sessions |

## Key Features

- **Premium Dark/Luxury Design**: Black (#121212) and Old Gold (#C8A856) palette with museum-quality typography
- **Inventory Tracking**: Transaction-safe MySQL updates with lightweight storefront refreshes
- **Secure Payments**: Server-side price authority, Stripe checkout, payment verification
- **Comprehensive Admin Dashboard**: Protected `/admin` route with analytics, inventory, orders, and customer management
- **Cart System**: Full cart with localStorage persistence, sticky summary, and museum-quality shop page
- **Transactional Emails**: Order confirmation, shipping, delivery, thank you, and review request flows
- **SEO Optimization**: Dynamic meta tags, Open Graph, JSON-LD structured data, sitemap, robots.txt
- **GA4 Integration**: Full e-commerce event tracking and conversion analytics

## Environment Variables

The following environment variables are required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string (`mysql://user:password@host:3306/database`) |
| `SESSION_SECRET` | Session encryption key |
| `CREDENTIAL_ENCRYPTION_KEY` | Encrypts Stripe credentials saved through the administrator settings page |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `VITE_GA4_MEASUREMENT_ID` | Google Analytics 4 ID |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email SMTP configuration |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run verify   # Type-check and create a production build
npm run db:push  # Push database schema changes
```

## Local setup

1. Install Node.js 22 and MySQL 8 or MariaDB 10.6+.
2. Copy `.env.example` to `.env` and set at least `DATABASE_URL` and a strong `SESSION_SECRET`.
3. Run `npm ci`.
4. Run `npm run db:push` to create/update the database tables.
5. Run `npm run dev`, then open the configured local port (currently `http://localhost:5001`).

The storefront can run without Stripe or email credentials; those integrations remain disabled until configured. Visit `/admin` after database setup to create the first administrator account. This one-time setup closes after the account is created.

Stripe can be connected after deployment from **Admin → Settings → Payments** without rebuilding the frontend. Administrator-entered secret and webhook credentials are encrypted at rest and never returned to the browser. Environment-based Stripe keys remain supported as a fallback.

## Authenticity registry

Every successfully purchased `coin120year` item is assigned one certificate serial in the same MySQL transaction that creates the order and decrements inventory. The edition is capped at 1,906 records and uses serials `1906-LE-000001` through `1906-LE-001906`.

- Public lookup page: `/verify`
- QR image: `/api/certificates/:serial/qr.svg`
- Private registry: `/admin/certificates`

Set `PUBLIC_BASE_URL=https://06coins.com` in production so printed QR codes contain the permanent public domain. Full purchaser details remain private in the administrator registry; the public lookup returns a shortened purchaser name.

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
  services/      # Email services
shared/          # Database schema definitions
  schema.ts      # Drizzle ORM schema
attached_assets/ # Product images and founder portraits
```

## License

MIT
