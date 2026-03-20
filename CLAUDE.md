# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for Logan Health's GLP-1 weight loss treatment service. Hosted at https://loganhealth.co.uk/

Developed mobile first to support mobile devices such as phones, tablets but also desktop screens.

### Workspace Structure

```
LoganHealthWorkspace/
├── LoganHealth.code-workspace    # VS Code workspace file
├── website/                      # This repo (GLPer-Ltd/LoganHealth-Website)
└── payments/                     # Cloudflare Worker (GLPer-Ltd/LoginHealth-Payments)
```

## Development

No build system - pure static files. To develop:
```bash
# Open in browser (macOS)
open index.html

# Or serve locally with Python
python3 -m http.server 8000
```

## Architecture

### JavaScript Modules (vanilla JS, no framework)

- **js/main.js** - Core UI: navigation, scroll animations (IntersectionObserver), smooth scroll, FAQ accordion. Exports `window.utils` with validation helpers (`isValidEmail`, `isValidUKPhone`)
- **js/questionnaire.js** - Multi-step form logic: BMI calculation, eligibility assessment, step validation. Exports `window.questionnaireState` containing all form data
- **js/formHandler.js** - Questionnaire submission. Reads from `window.questionnaireState` and POSTs to Worker `/api/submit-questionnaire`

### Data Flow (Questionnaire)
1. User fills questionnaire → data saved to `questionnaireState.data`
2. On submit → `checkEligibility()` evaluates BMI/age/conditions
3. `submitToFormspree()` sends data to pharmacy email
4. Results screen shows eligible (payment options) or not-eligible message

## Payment Integration

Payment is required before booking a consultation. The system uses a **provider abstraction** pattern with redirect-based checkout. The active provider (Stripe/Ryft) is set via config in the Worker.

### Payment Flow
1. User completes questionnaire and is eligible
2. User selects medication: **Wegovy** (£149) or **Mounjaro** (£199)
3. Website calls Worker `POST /api/create-checkout` with `{name, email, product}`
4. Worker creates checkout session with active provider, returns redirect URL
5. Website redirects user to provider-hosted checkout page
6. Provider processes payment, redirects to `/payment-success.html?session_id=xxx`
7. Provider webhook fires → Worker verifies, generates booking token, sends email
8. User receives email with tokenized booking link
9. User clicks link → `/book.html?token=xxx`
10. Booking page validates token with Worker, shows Calendly if valid

### Architecture Components

```
┌─────────────────┐                    ┌──────────────────────────────────┐
│  Static Site    │   create-checkout  │  Cloudflare Worker               │
│  (GitHub Pages) │───────────────────▶│  loganhealth-payments            │
│                 │◀──checkoutUrl──────│  .misty-heart-ac54.workers.dev   │
└────────┬────────┘                    └───────────────┬──────────────────┘
         │ redirect                                    │
         ▼                                             │
┌─────────────────┐    webhook    ┌────────────────┐   │
│ Payment Provider│──────────────▶│ /api/webhook/* │   │
│ (Stripe / Ryft) │               └────────────────┘   │
└─────────────────┘                        │           │
                              ┌────────────┴───────────┤
                              ▼            ▼           ▼
                        ┌──────────┐ ┌───────────┐
                        │ Resend   │ │ Cloudflare│
                        │ (email)  │ │ KV Store  │
                        └──────────┘ └───────────┘
```

### Cloudflare Worker (`loganhealth-payments`)

**Location:** Separate repo at `../payments/` (GitHub: GLPer-Ltd/LoginHealth-Payments)

**Endpoints:**
- `POST /api/create-checkout` - Create checkout session, return redirect URL
- `POST /api/webhook/stripe` - Stripe webhook → verify, generate token, send email
- `POST /api/webhook/ryft` - Ryft webhook (future)
- `GET /api/payment-status` - Check checkout session status
- `GET /api/validate-token` - Validate booking token
- `POST /api/mark-used` - Mark token as used after booking
- `POST /api/submit-questionnaire` - Email questionnaire to pharmacy
- `GET /health` - Health check

**Environment variables (wrangler.toml):**
- `PAYMENT_PROVIDER` - `"stripe"` or `"ryft"`
- `PRICE_WEGOVY` - Wegovy price in pence (default: `14900`)
- `PRICE_MOUNJARO` - Mounjaro price in pence (default: `19900`)
- `PAYMENT_CURRENCY` - Currency code (default: `gbp`)
- `BOOKING_TOKEN_TTL` - Token expiry in seconds (default: `259200` = 72 hours)
- `SITE_URL` - Base URL for booking links and checkout redirects
- `EMAIL_FROM` - Sender email address

**Secrets (set via `wrangler secret put`):**
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `EMAIL_API_KEY` - Resend API key

**KV Namespace:** `BOOKING_TOKENS` - stores tokens with 72-hour TTL

### Static Site Payment Files

- **js/questionnaire.js** - Eligibility logic, medication selection buttons, `redirectToPayment(product)`
- **js/payment.js** - Calls Worker `/api/create-checkout`, redirects to provider checkout. `WORKER_URL` constant
- **js/booking.js** - Token validation logic, Calendly embed. `WORKER_URL` constant
- **js/formHandler.js** - Questionnaire submission to Worker. `WORKER_URL` constant
- **payment.html** - Checkout redirect page (loading state)
- **book.html** - Token-gated booking page with Calendly
- **payment-success.html** - Post-payment confirmation with session verification

### External Services

| Service | Purpose | Account |
|---------|---------|---------|
| Cloudflare | Worker hosting, KV storage | peter@glper.com |
| Stripe | Payment processing | - |
| Resend | Transactional email | peter@glper.com |

### Switching Payment Provider

1. Set `PAYMENT_PROVIDER` in `wrangler.toml` (e.g., `"ryft"`)
2. Set provider secrets: `wrangler secret put RYFT_SECRET_KEY`, `wrangler secret put RYFT_WEBHOOK_SECRET`
3. Configure webhook endpoint in provider dashboard
4. Redeploy: `npm run deploy:production`
5. No website changes needed

### CSS Organization

- **css/styles.css** - All styles with CSS custom properties in `:root` for theming
- **css/animations.css** - Scroll animations, keyframes, transitions

### Theming

All colors defined as CSS variables in `:root`. To change brand colors, edit these in `css/styles.css`:
```css
--color-primary: #0D9488;      /* Main teal */
--color-secondary: #F97316;    /* CTA coral */
```

## index.html Section Map (top to bottom)

The homepage is a large single-page layout. Key sections and their approximate line ranges:

| Section | Lines (approx) | HTML ID / Class | Notes |
|---------|----------------|-----------------|-------|
| Navigation | 28-58 | `#navbar` | Nav links + CTA button |
| Review Banner | 60-72 | `#reviewBanner` | Rotating review ticker at top |
| Hero | 74-142 | `#hero` | Video bg, title, subtitle, trust badges, image tiles |
| How It Works | 144-256 | `#how-it-works` | 3-step cards with connector arrows |
| What Makes Us Different | 258-333 | `.why-different` | Checklist grid of differentiators + footnote |
| What's Included in Price | 335-407 | `#whats-included` | 5 image+text cards (medication price inclusions) |
| Testimonials (Google Reviews) | 409-510 | `.reviews` | Real patient review cards |
| Treatments | 512-682 | `#treatments` | Wegovy/Mounjaro cards + comparison table |
| Success Stories | 684-776 | `.success-stories` | Patient transformation stories |
| Companion App | 778-894 | `#glper-app` | App features list + screenshot |
| Pricing | ~896-980 | `#pricing` | One-off vs subscription pricing cards |
| About Us | ~982-1050 | `#about` | Team info, pharmacy history |
| FAQ | ~1052-1200 | `#faq` | Accordion FAQ items |
| Questionnaire | ~1200+ | `#questionnaire` | Multi-step eligibility form |
| Footer | end | `footer` | Contact info, links, legal |

**Note:** Line numbers shift as content is edited. Use section IDs/classes to locate sections reliably.

## Image Assets

| Directory | Contents |
|-----------|----------|
| `images/hero/` | Hero section image tiles (happy customer, calorie deficit, recipe, consultation) |
| `images/included/` | "What's included in price" section images (jab, consultation, deficit, food, app) |
| `images/illustrations/` | Treatment info illustrations (what to expect, eating well, side effects) |
| `images/` | App screenshots (`glper-app.png`), store buttons, medication pen images, logo |

## Key Configuration Points

1. **Formspree endpoint** — `js/formHandler.js` line 17: `FORMSPREE_ENDPOINT`
2. **Calendly URL** — `index.html` search for `calendly-inline-widget`
3. **Treatment pricing** — `index.html` search for `price-amount`
4. **Monthly plan pricing** — Hero section, `.hero-pricing` element (placeholder `£XX` pending confirmation)
5. **Pharmacy contact info** — Multiple locations in `index.html`
6. **App store links** — Removed from homepage per Feb 2026 update; app is now referenced generically
7. **Review banner data** — `js/main.js` contains the rotating review array

## Branding Notes

- The app was originally branded "GLPer" and is being rebranded to "Logan Health" across the site
- Nav link changed from "GLPer App" to "App" (Feb 2026)
- App section title changed from "Track Your Progress with GLPer" to "Track Your Progress with our App"
- App Store / Google Play download buttons removed from homepage

## Eligibility Logic (questionnaire.js)

- BMI ≥ 30 (or ≥ 27.5 for non-white ethnicity)
- BMI ≥ 27 with weight-related conditions (diabetes, hypertension, heart disease)
- Age 18-85
- Not pregnant/breastfeeding
- Eating disorders and pancreatitis flagged for pharmacist review
