# Design Guidelines: Alpha Phi Alpha 120th Anniversary Commemorative Coin

## Design Approach
**Premium Luxury E-Commerce**: Inspired by world-class luxury brands (Tiffany & Co., Rolex, Cartier), this design balances heritage with modern sophistication. The aesthetic celebrates 120 years of Alpha Phi Alpha brotherhood through refined typography, generous white space, and museum-quality presentation. Every element serves the dual purpose of honoring the legacy while creating desire for ownership.

## Core Design Principles
1. **Monumental Prestige**: Every element conveys gravitas and historical significance
2. **Controlled Scarcity**: Real-time inventory creates urgency without desperation
3. **Brotherhood Legacy**: Storytelling that honors the Jewels and fraternity values
4. **Luxury E-Commerce**: Premium feel worthy of a commemorative artifact

---

## Typography

**Primary Headings** (Playfair Display - Serif)
- Hero Title: 5xl-8xl, bold, tight tracking, white
- Section Headers: 4xl-6xl, bold, gold, centered
- Subsection Headers: 2xl-3xl, gold
- Letter spacing: 0.05em for monumental feel

**Body Text** (Roboto - Sans-serif)
- Primary: xl-2xl, white with 90% opacity
- Secondary: lg-xl, white with 80% opacity
- Small Print: sm-base, white with 70% opacity

**Accent Text**
- Gold quotes/mantras: 2xl-3xl, Playfair Display, gold, wide tracking
- Stock counter: 2xl, bold, red (urgent) or gold (available)

---

## Layout System

**Spacing Units**: Use Tailwind spacing of 4, 6, 8, 12, 16, 24 for consistency
- Section padding: py-16 to py-24 (desktop), py-8 to py-12 (mobile)
- Content max-width: max-w-6xl for main content, max-w-3xl for text-heavy sections
- Grid gaps: gap-10 for feature grids, gap-6 for tighter layouts

**Viewport Strategy**
- Hero: min-h-screen with centered content
- Content sections: Natural height based on content
- Sticky header: Always visible for scarcity messaging

---

## Component Library

### Navigation
**Sticky Header**
- Background: Black with 95% opacity, backdrop blur
- Border: Bottom border in gold with 30% opacity
- Layout: Logo left, stock counter + CTA right
- Shadow: Subtle shadow for depth
- Height: py-3

### Hero Section
**Layout**: Full viewport centered with vertical flow
- Fraternity motto at top (gold, centered)
- Main headline (massive, white, tight tracking)
- 3D coin render (max-w-lg, centered, with gold pulse animation)
- Descriptive text (max-w-3xl)
- Primary CTA button

### Scarcity Module
**Live Counter Display**
- Large numerical display (2xl, bold)
- Status text changes: "Limited Edition - Only X Remaining" (available) or "SOLD OUT" (depleted)
- Color transitions: Gold (available) → Red (urgent/sold out)
- Updates in real-time via Firebase

### Call-to-Action Buttons
**Primary CTA**
- Background: Gold (#C8A856)
- Text: Dark/black, bold, uppercase
- Padding: py-4 px-12 for hero, py-2 px-4 for header
- Border radius: rounded-xl for hero, rounded-lg for header
- Shadow: 2xl for prominence
- Hover: Lighter gold, slight scale (1.05)
- Sold-out state: Gray background, "JOIN WAITLIST" text, disabled

### Content Grids
**3-Column Feature Grid**
- Desktop: grid-cols-3
- Tablet: grid-cols-2
- Mobile: grid-cols-1
- Each card: Space-y-4, with gold header and white body text

### Product Showcase
**Specifications Display**
- Two-column layout: Image/render left, specs right
- Specification list: Bullet points or definition list format
- Pricing tiers: Card-based layout with clear differentiation

### Story Sections
**Historical Narrative**
- Full-width sections with max-w-6xl container
- Horizontal dividers: Gold with 30% opacity between sections
- Text blocks: Generous line-height (1.7-1.8) for readability

---

## Visual Elements

### Colors (Reference Only - Already Defined)
- Primary gold, dark background, white text with varying opacity
- Red accent for urgency/scarcity

### Borders & Dividers
- Gold borders at 30% opacity for subtle separation
- 4px solid gold borders for coin render placeholder
- Horizontal rules: border-gold/30, max-w-4xl, centered

### Shadows & Depth
- Header: shadow-lg for floating effect
- Buttons: shadow-2xl for hero CTAs, shadow-md for header CTAs
- Coin placeholder: Animated glow (pulse-gold animation)

### Special Effects
**Gold Pulse Animation** (Coin Render)
- Alternating box-shadow glow from subtle to prominent
- 2-second duration, infinite loop
- Creates living, breathing artifact effect

**Scrollbar Customization**
- Width: 8px
- Thumb: Gold with rounded corners
- Track: Slightly lighter than background

---

## Images

**Hero Coin Imagery**
- Placement: Center of hero section, below headline
- Size: max-w-2xl (600-800px) for impactful presence
- Treatment: High-resolution coin photography or 3D render on clean black background
- Background: Pure black or subtle radial gradient emphasizing the gold coin
- Lighting: Dramatic side lighting to highlight relief details and metallic finish
- Purpose: Museum-quality product showcase that commands attention

**Lifestyle & Context Photography**
- Professional, editorial-style imagery showing the coin in luxury settings
- Warm, sophisticated lighting matching the Black & Gold aesthetic
- Minimal props, maximum focus on the coin as artifact
- High contrast, sharp focus, professional color grading

**Supporting Images** (if needed)
- Historical photos: Cornell founding, Jewel portraits (sepia or desaturated for cohesion)
- Coin detail shots: Close-ups of engravings, edges
- Fraternity events: Modern brotherhood in action (subtle, supporting role)

---

## Responsive Behavior

**Breakpoints**
- Mobile: Single column, stacked layout
- Tablet (md:): 2-column grids where appropriate
- Desktop (lg:): Full 3-column grids, larger typography

**Header Adaptation**
- Mobile: Stack or abbreviate stock counter text
- Desktop: Full horizontal layout with all elements visible

**Typography Scaling**
- Hero: 5xl (mobile) → 8xl (desktop)
- Sections: 4xl (mobile) → 6xl (desktop)
- Buttons: Adjust padding for mobile (py-3 px-6 vs py-4 px-12)

---

## Key Interactions

**Smooth Scrolling**
- CTA buttons scroll to purchase module with smooth behavior
- Navigation feels fluid and intentional

**Dynamic State Changes**
- Stock counter updates in real-time
- Button text/state changes: "SECURE YOUR COIN NOW" → "JOIN WAITLIST"
- Color transitions for urgency (gold → red)

**Loading States**
- Stock counter shows "..." until Firebase connects
- Graceful error messages if connection fails

---

## Content Strategy

**Above-the-Fold Priority**
1. Fraternity motto (emotional hook)
2. Monumental headline (impact)
3. 3D coin visual (product showcase)
4. Scarcity indicator (urgency)
5. Primary CTA (conversion)

**Section Flow**
1. Hero (Impact & Product)
2. Story & Significance (Emotional Connection)
3. Coin Features & Specifications (Product Details)
4. Pricing & Purchase Module (Conversion)
5. FAQ/Trust Signals (Objection Handling)
6. Footer (Secondary Navigation, Contact)

**Tone of Voice**
- Reverent but not stuffy
- Prestigious without being exclusive
- Urgent through scarcity, not aggressive marketing
- Brotherhood-focused, community-driven