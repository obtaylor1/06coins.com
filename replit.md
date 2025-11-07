# Alpha Phi Alpha 120th Anniversary Commemorative Coin

## Overview
A premium e-commerce website for the Alpha Phi Alpha Fraternity's 120th Anniversary Commemorative Coin. The site features real-time inventory tracking with Firebase Firestore and secure payment processing through Stripe.

## Current Status
**Phase**: Frontend Development Complete ✓

### Completed Features
- ✅ Design system configured with Alpha Phi Alpha branding (Gold #C8A856 on Black)
- ✅ Sticky header with live stock counter
- ✅ Hero section with fraternity motto and animated coin placeholder
- ✅ Story section highlighting the Jewels' vision and 120-year legacy
- ✅ Product showcase with detailed specifications
- ✅ "Why Own This Coin" section with three compelling reasons
- ✅ Purchase module with quantity selector
- ✅ Responsive design for mobile and desktop
- ✅ SEO optimization with meta tags
- ✅ Data schema for inventory and orders

### In Progress
- Backend API endpoints for inventory and payments
- Firebase Firestore integration for real-time stock updates
- Stripe checkout flow

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
- Firebase Firestore (real-time inventory)
- Stripe API (payment processing)
- In-memory storage (will migrate to database)

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
│   ├── pages/
│   │   ├── home.tsx
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts
└── storage.ts
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

## Testing Checklist

Without Firebase (current state):
- ✅ Inventory API works with in-memory storage
- ✅ Stock counter shows on frontend (polling every 5 seconds)
- ✅ Checkout flow decrements inventory after payment
- ✅ Orders are recorded in memory
- ✅ Sold-out state works correctly

With Firebase (once credentials added):
- Real-time stock updates across all browsers
- Inventory syncs to Firestore on every change
- Persistent inventory across server restarts

## User Preferences
- Dark mode only (Alpha Phi Alpha branding)
- Monumental, prestigious aesthetic
- Limited edition scarcity messaging
- Professional, heritage-focused tone
