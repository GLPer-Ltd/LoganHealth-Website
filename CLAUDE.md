# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro static site for Logan Health's GLP-1 weight loss treatment service. Hosted at https://loganhealth.co.uk/ via GitHub Pages.

Developed mobile first to support mobile devices such as phones, tablets but also desktop screens.

### Workspace Structure

```
LoganHealthWorkspace/
+-- LoganHealth.code-workspace    # VS Code workspace file
+-- website/                      # This repo (GLPer-Ltd/LoganHealth-Website)
+-- payments/                     # Cloudflare Worker (GLPer-Ltd/LoginHealth-Payments)
```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:4321
npm run build        # Build static site to dist/
npm run preview      # Preview production build locally
```

Deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`) on push to main. Output uses Astro directory-style clean URLs (no .html extensions).

## Architecture

### Astro Project Structure

```
website/
+-- src/
|   +-- pages/              # Astro page files (.astro)
|   +-- layouts/            # Page layouts
|   +-- components/         # Shared components
+-- public/                 # Static assets (copied as-is to dist/)
|   +-- css/                # Stylesheets
|   +-- js/                 # Vanilla JS modules
|   +-- images/             # Image assets
|   +-- assets/video/       # Video files
|   +-- favicon.svg
+-- astro.config.mjs        # Astro configuration
+-- package.json
```

### Layouts

| Layout | File | Used by | Description |
|--------|------|---------|-------------|
| BaseLayout | `src/layouts/BaseLayout.astro` | Public-facing pages | Full nav (Header), footer, GSAP animations, WhatsApp button |
| FlowLayout | `src/layouts/FlowLayout.astro` | Transactional pages | Minimal header (FlowHeader), no footer, no GSAP |

### Components

| Component | File | Description |
|-----------|------|-------------|
| Head | `src/components/Head.astro` | HTML head: meta tags, fonts, CSS links |
| Header | `src/components/Header.astro` | Full navigation bar with links and CTA |
| FlowHeader | `src/components/FlowHeader.astro` | Minimal header for transactional flow pages |
| Footer | `src/components/Footer.astro` | Site footer with contact info and links |
| WhatsAppButton | `src/components/WhatsAppButton.astro` | Floating WhatsApp support button |

### Pages

| Page | File | Layout | Purpose |
|------|------|--------|---------|
| `/` | `src/pages/index.astro` | BaseLayout | Landing page with questionnaire, pricing, FAQ |
| `/choose-medication` | `src/pages/choose-medication.astro` | FlowLayout | Contact details + medication selection |
| `/payment` | `src/pages/payment.astro` | FlowLayout | Checkout redirect (loading state) |
| `/book` | `src/pages/book.astro` | FlowLayout | Token-gated booking with Calendly |
| `/payment-success` | `src/pages/payment-success.astro` | FlowLayout | Post-payment confirmation |
| `/mounjaro` | `src/pages/mounjaro.astro` | BaseLayout | Mounjaro product page |
| `/wegovy` | `src/pages/wegovy.astro` | BaseLayout | Wegovy product page |
| `/privacy` | `src/pages/privacy.astro` | BaseLayout | Privacy policy |
| `/terms` | `src/pages/terms.astro` | BaseLayout | Terms and conditions |
| `/tdee` | `src/pages/tdee.astro` | BaseLayout | TDEE calculator |
| `/article-eating-well` | `src/pages/article-eating-well.astro` | BaseLayout | Article page |
| `/article-first-month` | `src/pages/article-first-month.astro` | BaseLayout | Article page |
| `/article-side-effects` | `src/pages/article-side-effects.astro` | BaseLayout | Article page |

### JavaScript Modules (vanilla JS in public/js/, no framework)

- **js/main.js** -- Core UI: navigation, scroll animations (IntersectionObserver), smooth scroll, FAQ accordion. Exports `window.utils` with validation helpers (`isValidEmail`, `isValidUKPhone`)
- **js/questionnaire.js** -- Multi-step form logic: BMI calculation, eligibility assessment, step validation. Stores data in `sessionStorage` (`lh_questionnaire`). Eligible users are redirected to `/choose-medication`
- **js/payment.js** -- Reads sessionStorage (`lh_checkout`), calls Worker `/api/create-checkout`, redirects to Stripe Checkout. `WORKER_URL` constant
- **js/booking.js** -- Token validation against Worker, Calendly embed. Handles both `?session_id=` (post-payment) and `?token=` (email link) entry. `WORKER_URL` constant
- **js/gsap-animations.js** -- GSAP ScrollTrigger animations
- **js/tdee.js** -- TDEE calculator logic

### sessionStorage Data Flow

Data passes between pages via sessionStorage:

1. **`lh_questionnaire`** -- Set by questionnaire.js on index page when user completes questionnaire. Contains all answers, eligibility result, and eligibility reason.
2. **`lh_checkout`** -- Set by choose-medication page. Contains name, email, phone, selected product, consent, marketing preference, plus the questionnaire data.
3. Payment.js reads `lh_checkout` and sends everything to the worker's `/api/create-checkout` endpoint.

### CSS Organization

- **css/styles.css** -- All styles with CSS custom properties in `:root` for theming
- **css/animations.css** -- Scroll animations, keyframes, transitions

### Theming

All colors defined as CSS variables in `:root`. To change brand colors, edit these in `css/styles.css`:
```css
--color-primary: #0D9488;      /* Main teal */
--color-secondary: #F97316;    /* CTA coral */
```

## Payment & Booking Flow

Payment is required before booking a consultation. The system uses a **provider abstraction** pattern with redirect-based checkout. The active provider (Stripe) is configured in the Worker.

### Flow

1. User completes questionnaire on index page and is eligible
2. Redirected to `/choose-medication` page
3. User enters contact details (name, email, phone) and selects Wegovy or Mounjaro
4. Ticks consent and terms checkboxes, clicks Continue to Payment
5. Redirected to `/payment` page which calls Worker `POST /api/create-checkout`
6. Worker creates Stripe Checkout session, returns redirect URL
7. User completes payment on Stripe-hosted page
8. Stripe redirects to `/book?session_id={CHECKOUT_SESSION_ID}`
9. Book page polls Worker `/api/payment-status` to get booking token
10. Once token is available, Calendly embed is shown
11. User selects date/time in Calendly and confirms booking
12. `POST /api/mark-used` invalidates token and triggers pharmacy email

A backup booking email is also sent via the Stripe webhook, so the user can book later even if they close the browser.

### Cloudflare Worker (`loganhealth-payments`)

**Location:** Separate repo at `../payments/` (GitHub: GLPer-Ltd/LoginHealth-Payments)

**Endpoints:**
- `POST /api/create-checkout` -- Create checkout session, store session data, return redirect URL
- `POST /api/webhook/stripe` -- Stripe webhook: verify, generate token, send backup booking email
- `GET /api/payment-status` -- Check checkout session status, return token
- `GET /api/validate-token` -- Validate booking token
- `POST /api/mark-used` -- Mark token as used, send pharmacy email
- `GET /health` -- Health check

**Secrets (set via `wrangler secret put`):**
- `STRIPE_SECRET_KEY` -- Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` -- Stripe webhook signing secret
- `EMAIL_API_KEY` -- Resend API key for sending emails

### External Services

| Service | Purpose | Account |
|---------|---------|---------|
| Cloudflare | Worker hosting, KV storage | peter@glper.com |
| Stripe | Payment processing | - |
| Resend | Transactional email | peter@glper.com |

## Image Assets

| Directory | Contents |
|-----------|----------|
| `public/images/hero/` | Hero section image tiles |
| `public/images/included/` | "What's included in price" section images |
| `public/images/illustrations/` | Treatment info illustrations |
| `public/images/` | App screenshots, medication pen images, logo |

## Key Configuration Points

1. **Worker URL** -- `public/js/booking.js` and `public/js/payment.js`: `WORKER_URL` constant
2. **Calendly URL** -- `src/pages/book.astro` search for `calendly`
3. **Treatment pricing** -- Shown on index page; source of truth is `wrangler.toml` in payments repo
4. **Pharmacy contact info** -- Multiple locations in page files
5. **Review banner data** -- `public/js/main.js` contains the rotating review array

## Eligibility Logic (questionnaire.js)

- BMI >= 30 (or >= 27.5 for non-white ethnicity)
- BMI >= 27 with weight-related conditions (diabetes, hypertension, heart disease)
- Age 18-85
- Not pregnant/breastfeeding
- Eating disorders and pancreatitis flagged for pharmacist review
