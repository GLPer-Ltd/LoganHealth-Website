# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Logan Health static website from hand-coded HTML to Astro, extracting shared components (header, footer, meta tags) into reusable layouts so changes propagate across all pages automatically.

**Architecture:** Create an Astro project in the existing website repo. Two layout variants: `BaseLayout` (full nav + footer for public pages) and `FlowLayout` (minimal header for transactional pages). Existing CSS and vanilla JS carry over unchanged — Astro outputs the same static HTML/CSS/JS with zero client-side framework overhead. GSAP, Calendly, and all external scripts load via Astro's `<script>` integration.

**Tech Stack:** Astro 5.x, existing vanilla JS, existing CSS (styles.css + animations.css), GitHub Pages deployment via `astro build`

---

## File Structure

```
website/
├── astro.config.mjs              # Astro config (static output, site URL)
├── package.json                   # Dependencies (astro only)
├── tsconfig.json                  # TypeScript config (Astro default)
├── public/                        # Static assets (copied as-is to build)
│   ├── favicon.svg
│   ├── images/                    # All existing images, unchanged
│   │   ├── hero/
│   │   ├── illustrations/
│   │   ├── included/
│   │   ├── wegovy-pen.png
│   │   ├── mounjaro-pen.png
│   │   └── ...
│   ├── css/
│   │   ├── styles.css             # Existing styles, unchanged
│   │   └── animations.css         # Existing animations, unchanged
│   └── js/
│       ├── main.js                # Existing, unchanged
│       ├── questionnaire.js       # Existing, unchanged
│       ├── booking.js             # Existing, unchanged
│       ├── payment.js             # Existing, unchanged
│       ├── gsap-animations.js     # Existing, unchanged
│       └── tdee.js                # Existing, unchanged
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Full nav + footer + WhatsApp (public pages)
│   │   └── FlowLayout.astro       # Minimal header (transactional pages)
│   ├── components/
│   │   ├── Header.astro           # Full navigation bar
│   │   ├── FlowHeader.astro       # Simple logo + back link header
│   │   ├── Footer.astro           # Complete footer with contact/hours/legal
│   │   ├── WhatsAppButton.astro   # Floating WhatsApp FAB
│   │   └── Head.astro             # Common <head> contents (fonts, CSS, favicon, meta)
│   └── pages/
│       ├── index.astro
│       ├── book.astro
│       ├── choose-medication.astro
│       ├── payment.astro
│       ├── payment-success.astro
│       ├── mounjaro.astro
│       ├── wegovy.astro
│       ├── tdee.astro
│       ├── article-eating-well.astro
│       ├── article-first-month.astro
│       ├── article-side-effects.astro
│       ├── privacy.astro
│       └── terms.astro
└── docs/                          # Preserved
```

### Layout Mapping

| Layout | Pages | Features |
|--------|-------|----------|
| BaseLayout | index, mounjaro, wegovy, tdee, articles, privacy, terms | Full nav, footer, WhatsApp button, GSAP scripts |
| FlowLayout | choose-medication, payment, payment-success, book | Simple logo header with back link, optional footer |

### Component Responsibilities

| Component | Single source of truth for |
|-----------|---------------------------|
| Head.astro | Fonts, favicon, CSS imports, viewport meta, charset |
| Header.astro | Nav bar, logo, nav links, mobile menu, "Start Your Journey" CTA |
| FlowHeader.astro | Logo + "Back to Homepage" link (used on payment/booking flow pages) |
| Footer.astro | Brand info, contact details, opening hours, quick links, social links, GPhC registration, legal links |
| WhatsAppButton.astro | Floating WhatsApp button with tooltip |
| BaseLayout.astro | Composes Head + Header + slot + Footer + WhatsApp + GSAP scripts |
| FlowLayout.astro | Composes Head + FlowHeader + slot + optional Footer |

---

## Task 1: Astro Project Setup

**Files:**
- Create: `astro.config.mjs`
- Create: `package.json` (new, Astro-specific)
- Create: `tsconfig.json`

- [ ] **Step 1: Initialize Astro project**

Run from `/Users/petersedman/projects/LoganHealthWorkspace/website/`:

```bash
npm create astro@latest . -- --template minimal --no-install --no-git
```

If prompted about existing files, choose to keep them. Then manually configure:

- [ ] **Step 2: Write astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://loganhealth.co.uk',
  output: 'static',
  build: {
    assets: '_assets',
  },
});
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

- [ ] **Step 4: Move static assets to public/**

```bash
mkdir -p public
mv images public/images
mv css public/css
mv js public/js
mv favicon.svg public/favicon.svg
```

- [ ] **Step 5: Create src directories**

```bash
mkdir -p src/layouts src/components src/pages
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Visit `http://localhost:4321` — should show Astro welcome page.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize Astro project structure"
```

---

## Task 2: Extract Shared Components

**Files:**
- Create: `src/components/Head.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/FlowHeader.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/WhatsAppButton.astro`

- [ ] **Step 1: Create Head.astro**

Extract the common `<head>` contents shared by all pages. Accept props for page-specific overrides (title, description, canonical, robots, OG tags).

```astro
---
interface Props {
  title: string;
  description?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

const {
  title,
  description = 'Logan Health - GLP-1 weight loss treatments including Wegovy and Mounjaro.',
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
} = Astro.props;

const siteName = 'Logan Health';
---

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | {siteName}</title>
<meta name="description" content={description}>
{robots && <meta name="robots" content={robots}>}
{canonical && <link rel="canonical" href={canonical}>}

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Styles -->
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="/css/animations.css">

<!-- Open Graph -->
{ogTitle && <meta property="og:title" content={ogTitle || title}>}
{ogDescription && <meta property="og:description" content={ogDescription || description}>}
<meta property="og:type" content={ogType}>
{ogImage && <meta property="og:image" content={ogImage}>}
<meta property="og:site_name" content={siteName}>
```

- [ ] **Step 2: Create Header.astro**

Extract the full navigation bar from `index.html` (lines ~28-58). The nav links, logo, mobile menu toggle, and "Start Your Journey" CTA. Accept an `activeLink` prop for highlighting the current page.

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/index.html` lines 60-130 (approximate — extract the full `<header class="navbar">` block).

- [ ] **Step 3: Create FlowHeader.astro**

The simple header used on transactional pages (payment, booking, choose-medication). Logo + back link.

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/book.html` lines 231-249.

Accept props: `backUrl` (default: "index.html"), `backText` (default: "Back to Homepage").

- [ ] **Step 4: Create Footer.astro**

Extract the complete footer from `index.html` (lines 2214-2307). Includes brand info, contact details, opening hours, quick links, social links, GPhC registration, legal links.

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/index.html` lines 2214-2307.

- [ ] **Step 5: Create WhatsAppButton.astro**

Extract the floating WhatsApp button from `index.html` (lines 2309-2319).

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/index.html` lines 2309-2319.

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: extract shared components (Head, Header, Footer, WhatsApp)"
```

---

## Task 3: Create Layouts

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/FlowLayout.astro`

- [ ] **Step 1: Create BaseLayout.astro**

Composes all shared components for public-facing pages. Loads GSAP and main.js.

```astro
---
import Head from '../components/Head.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  scripts?: string[];
}

const { title, scripts = [], ...headProps } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <Head title={title} {...headProps} />
  <slot name="head" />
</head>
<body>
  <Header />
  <slot />
  <Footer />
  <WhatsAppButton />

  <!-- GSAP -->
  <script is:inline src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script is:inline src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script is:inline src="/js/main.js"></script>
  <script is:inline src="/js/gsap-animations.js"></script>
  {scripts.map(src => <script is:inline src={src}></script>)}
</body>
</html>
```

- [ ] **Step 2: Create FlowLayout.astro**

Minimal layout for transactional pages. Optional footer.

```astro
---
import Head from '../components/Head.astro';
import FlowHeader from '../components/FlowHeader.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  robots?: string;
  backUrl?: string;
  backText?: string;
  showFooter?: boolean;
}

const {
  title,
  backUrl = '/',
  backText = 'Back to Homepage',
  showFooter = false,
  ...headProps
} = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <Head title={title} robots="noindex, nofollow" {...headProps} />
  <slot name="head" />
</head>
<body>
  <FlowHeader backUrl={backUrl} backText={backText} />
  <slot />
  {showFooter && <Footer />}
  <slot name="scripts" />
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/
git commit -m "feat: create BaseLayout and FlowLayout"
```

---

## Task 4: Migrate Simple Pages First

Migrate the simplest pages to validate the layout system works correctly.

**Files:**
- Create: `src/pages/privacy.astro`
- Create: `src/pages/terms.astro`
- Delete (after migration): `privacy.html`, `terms.html`

- [ ] **Step 1: Migrate privacy.astro**

Wrap the unique content of `privacy.html` in BaseLayout. The page body content (everything between nav and footer) goes into the default slot.

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/privacy.html`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Privacy Policy" canonical="https://loganhealth.co.uk/privacy">
  <!-- Page-specific content from privacy.html (everything between nav and footer) -->
</BaseLayout>
```

- [ ] **Step 2: Migrate terms.astro**

Same pattern as privacy.

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/terms.html`

- [ ] **Step 3: Verify locally**

```bash
npm run dev
```

Visit `http://localhost:4321/privacy` and `http://localhost:4321/terms`. Verify header, footer, and content render correctly. Compare side-by-side with the original HTML files.

- [ ] **Step 4: Delete originals and commit**

```bash
rm privacy.html terms.html
git add -A
git commit -m "feat: migrate privacy and terms pages to Astro"
```

---

## Task 5: Migrate Product Pages

**Files:**
- Create: `src/pages/mounjaro.astro`
- Create: `src/pages/wegovy.astro`
- Delete: `mounjaro.html`, `wegovy.html`

- [ ] **Step 1: Migrate mounjaro.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/mounjaro.html`

Wrap page content in BaseLayout. Include OG meta via props.

- [ ] **Step 2: Migrate wegovy.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/wegovy.html`

- [ ] **Step 3: Verify locally and compare with originals**

- [ ] **Step 4: Delete originals and commit**

```bash
rm mounjaro.html wegovy.html
git add -A
git commit -m "feat: migrate product pages to Astro"
```

---

## Task 6: Migrate Article Pages

**Files:**
- Create: `src/pages/article-eating-well.astro`
- Create: `src/pages/article-first-month.astro`
- Create: `src/pages/article-side-effects.astro`
- Delete: `article-eating-well.html`, `article-first-month.html`, `article-side-effects.html`

- [ ] **Step 1: Migrate all three article pages**

Each follows the same pattern — wrap content in BaseLayout with article-specific OG meta.

Source files:
- `/Users/petersedman/projects/LoganHealthWorkspace/website/article-eating-well.html`
- `/Users/petersedman/projects/LoganHealthWorkspace/website/article-first-month.html`
- `/Users/petersedman/projects/LoganHealthWorkspace/website/article-side-effects.html`

- [ ] **Step 2: Verify locally**

- [ ] **Step 3: Delete originals and commit**

```bash
rm article-eating-well.html article-first-month.html article-side-effects.html
git add -A
git commit -m "feat: migrate article pages to Astro"
```

---

## Task 7: Migrate TDEE Calculator

**Files:**
- Create: `src/pages/tdee.astro`
- Delete: `tdee.html`

- [ ] **Step 1: Migrate tdee.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/tdee.html`

Uses BaseLayout with extra script: `scripts={['/js/tdee.js']}`. Also includes schema.org structured data in a `<slot name="head">` block.

- [ ] **Step 2: Verify calculator works (unit toggles, calculation, results)**

- [ ] **Step 3: Delete original and commit**

```bash
rm tdee.html
git add -A
git commit -m "feat: migrate TDEE calculator to Astro"
```

---

## Task 8: Migrate Transactional Pages (FlowLayout)

**Files:**
- Create: `src/pages/choose-medication.astro`
- Create: `src/pages/payment.astro`
- Create: `src/pages/payment-success.astro`
- Create: `src/pages/book.astro`
- Delete: `choose-medication.html`, `payment.html`, `payment-success.html`, `book.html`

- [ ] **Step 1: Migrate choose-medication.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/choose-medication.html`

Uses FlowLayout. Has significant page-specific `<style>` and inline `<script>`. These stay in the page file — Astro supports scoped styles and inline scripts natively.

```astro
---
import FlowLayout from '../layouts/FlowLayout.astro';
---

<FlowLayout title="Choose Your Medication">
  <style slot="head"> /* page-specific styles */ </style>

  <!-- Page content (medication cards, contact form, etc.) -->

  <script is:inline slot="scripts">
    // Inline medication selection + contact form logic
  </script>
</FlowLayout>
```

- [ ] **Step 2: Migrate payment.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/payment.html`

Uses FlowLayout. Loads `/js/payment.js`.

- [ ] **Step 3: Migrate payment-success.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/payment-success.html`

Uses FlowLayout. Has inline verification script.

- [ ] **Step 4: Migrate book.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/book.html`

Uses FlowLayout with `showFooter={true}`. Loads Calendly CSS/JS and `/js/booking.js`.

```astro
---
import FlowLayout from '../layouts/FlowLayout.astro';
---

<FlowLayout title="Book Your Consultation" showFooter={true}>
  <link slot="head" href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">

  <!-- Hero, loading, error, success states with Calendly widget -->

  <Fragment slot="scripts">
    <script is:inline src="https://assets.calendly.com/assets/external/widget.js" async></script>
    <script is:inline src="/js/booking.js"></script>
  </Fragment>
</FlowLayout>
```

- [ ] **Step 5: Test the full payment flow end-to-end**

Complete questionnaire → choose medication → payment redirect → booking page. Verify sessionStorage data flows correctly between pages.

- [ ] **Step 6: Delete originals and commit**

```bash
rm choose-medication.html payment.html payment-success.html book.html
git add -A
git commit -m "feat: migrate transactional pages to Astro FlowLayout"
```

---

## Task 9: Migrate Index Page (Largest)

**Files:**
- Create: `src/pages/index.astro`
- Delete: `index.html`

- [ ] **Step 1: Migrate index.astro**

Source: `/Users/petersedman/projects/LoganHealthWorkspace/website/index.html` (2333 lines)

The largest page. Uses BaseLayout with extra scripts for questionnaire:
```astro
scripts={['/js/questionnaire.js']}
```

The page content includes: review banner, hero, how-it-works, why-different, what's-included, testimonials, treatments, success-stories, companion app, pricing, about, FAQ, questionnaire form.

All of this goes in the default slot. The shared nav, footer, GSAP, and main.js are handled by BaseLayout.

Also includes Calendly widget CSS (for the inline booking widget reference) and schema.org structured data in the head slot.

- [ ] **Step 2: Verify locally**

Test every section: navigation scroll links, mobile menu, FAQ accordion, questionnaire flow (all 10 steps), eligibility result, "Choose Your Medication" button redirect.

- [ ] **Step 3: Delete original and commit**

```bash
rm index.html
git add -A
git commit -m "feat: migrate index page to Astro"
```

---

## Task 10: Clean Up and Configure Deployment

**Files:**
- Modify: `package.json` (build/deploy scripts)
- Create: `.github/workflows/deploy.yml` (optional — GitHub Pages via Actions)
- Delete: remaining old HTML files, old README deployment instructions

- [ ] **Step 1: Update .gitignore**

Add Astro build artifacts:

```
node_modules/
dist/
.astro/
```

- [ ] **Step 2: Verify full build**

```bash
npm run build
```

Check `dist/` output — should contain all pages as static HTML with correct paths to CSS, JS, and images.

- [ ] **Step 3: Preview build locally**

```bash
npm run preview
```

Visit `http://localhost:4321` and test all pages and flows.

- [ ] **Step 4: Configure GitHub Pages deployment**

Option A: GitHub Actions (recommended) — create `.github/workflows/deploy.yml` that runs `npm run build` and deploys `dist/` to GitHub Pages.

Option B: Manual — run `npm run build` locally and push `dist/` contents.

- [ ] **Step 5: Remove old HTML files that haven't been deleted yet**

Check for any remaining `.html` files in the root that should have been migrated.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: configure Astro build and deployment"
```

---

## Task 11: Verify Production Deployment

- [ ] **Step 1: Deploy to GitHub Pages**

- [ ] **Step 2: Verify all pages load correctly on the live site**

Check: index, mounjaro, wegovy, tdee, all articles, privacy, terms, choose-medication, payment, book

- [ ] **Step 3: Test full payment flow on live site**

Questionnaire → eligible → choose medication → payment → Stripe → booking page → Calendly

- [ ] **Step 4: Verify SEO**

Check canonical URLs, OG tags, robots meta, structured data all render correctly in the built HTML.

---

## Notes

- **CSS and JS are unchanged.** All existing styles.css, animations.css, and JS files move to `public/` and load exactly as before. No refactoring needed.
- **No client-side framework.** Astro outputs pure static HTML. The vanilla JS scripts load via `<script is:inline>` which tells Astro to include them as-is without processing.
- **Page-specific styles** (inline `<style>` blocks in choose-medication, payment, book) stay in each `.astro` page file. Astro scopes them automatically.
- **GSAP scripts** load in BaseLayout only. FlowLayout pages don't need GSAP since they have no scroll animations.
- **formHandler.js** is no longer loaded (was removed from index.html in the payment refactor). It can be deleted from `public/js/` if present.
