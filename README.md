# Logan Health - GLP-1 Weight Loss Website

A professional, modern website for Logan Health enabling customers to access GLP-1 weight loss medications through an online health questionnaire and consultation booking system.

## Features

- **Health Questionnaire**: Multi-step form assessing eligibility for GLP-1 treatments
- **BMI Calculator**: Automatic calculation with metric/imperial unit toggle
- **Eligibility Assessment**: Real-time eligibility checking based on clinical criteria
- **Calendly Integration**: Appointment booking for consultations
- **Formspree Integration**: Email submissions to pharmacy
- **GLPer App Promotion**: Integrated promotion of the companion app
- **Responsive Design**: Mobile-first, works on all devices
- **Smooth Animations**: Professional scroll and interaction animations
- **Accessibility**: WCAG compliant with keyboard navigation

## Quick Start

1. **Clone/Download** this repository
2. **Configure Formspree** (see below)
3. **Configure Calendly** (see below)
4. **Deploy** to GitHub Pages or any static hosting

## Configuration

### Formspree Setup

1. Go to [https://formspree.io](https://formspree.io)
2. Create a free account (50 submissions/month free)
3. Create a new form
4. Copy your form endpoint URL (e.g., `https://formspree.io/f/xxxxxxxx`)
5. Open `js/formHandler.js`
6. Replace `YOUR_FORM_ID` with your actual form ID:

```javascript
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```

### Calendly Setup

1. Go to [https://calendly.com](https://calendly.com)
2. Create a free account
3. Create a new event type:
   - Name: "GLP-1 Consultation"
   - Duration: 15-30 minutes
   - Configure availability to match pharmacy hours (Mon-Fri 9am-7pm, Sat 9am-5pm)
4. Go to your event page and click "Share"
5. Copy the "Add to website" embed link
6. Open `index.html`
7. Find the Calendly widget section and update the `data-url`:

```html
<div class="calendly-inline-widget"
     data-url="https://calendly.com/YOUR_USERNAME/glp1-consultation"
     style="min-width:320px;height:630px;">
</div>
```

## Customising Brand Colors

All colors are defined as CSS custom properties in `css/styles.css`. To change the color scheme, edit the `:root` section:

```css
:root {
    /* Primary - Calming Teal */
    --color-primary: #0D9488;
    --color-primary-light: #14B8A6;
    --color-primary-dark: #0F766E;

    /* Secondary - Warm Coral (CTAs) */
    --color-secondary: #F97316;
    --color-secondary-light: #FB923C;
    --color-secondary-dark: #EA580C;

    /* ... other colors ... */
}
```

### Suggested Alternative Color Schemes

**Ocean Blue:**
```css
--color-primary: #0EA5E9;
--color-primary-light: #38BDF8;
--color-primary-dark: #0284C7;
```

**Forest Green:**
```css
--color-primary: #22C55E;
--color-primary-light: #4ADE80;
--color-primary-dark: #16A34A;
```

**Purple Wellness:**
```css
--color-primary: #8B5CF6;
--color-primary-light: #A78BFA;
--color-primary-dark: #7C3AED;
```

## Deployment to GitHub Pages

### Method 1: Using GitHub UI

1. Create a new repository on GitHub
2. Upload all files from this folder
3. Go to Settings > Pages
4. Under "Source", select "main" branch
5. Save and wait for deployment
6. Your site will be live at `https://yourusername.github.io/repositoryname`

### Method 2: Using Git Command Line

```bash
# Initialise git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Logan Health GLP-1 website"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/pe-logan-glp1.git

# Push
git push -u origin main
```

Then enable GitHub Pages in repository settings.

## File Structure

```
pe-logan-glp1/
├── index.html              # Main website
├── css/
│   ├── styles.css          # Main styles + CSS variables
│   └── animations.css      # Scroll animations
├── js/
│   ├── main.js             # Navigation, smooth scroll
│   ├── questionnaire.js    # Form logic, BMI, eligibility
│   └── formHandler.js      # Formspree submission
├── images/
│   ├── logo.svg            # Pharmacy logo (add your own)
│   └── icons/              # SVG icons
└── README.md               # This file
```

## Updating Content

### Pharmacy Details

Edit `index.html` to update:
- Address
- Phone number
- Email
- Opening hours
- Google Maps embed

### Treatment Pricing

Find and update the price cards in the "Treatments" section:

```html
<span class="price-amount">&pound;149</span>  <!-- Wegovy -->
<span class="price-amount">&pound;199</span>  <!-- Mounjaro -->
```

### FAQ Questions

Add or modify FAQ items in the `#faq` section.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Performance Tips

- Images should be optimised before adding
- Use WebP format where possible
- The site uses lazy loading for images
- Consider enabling gzip compression on server

## Legal Considerations

Before going live, ensure you have:
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie Policy (if using tracking)
- [ ] GDPR compliance reviewed
- [ ] Healthcare advertising regulations compliance

## Support

For technical issues with this website template, please contact the developer.

For pharmacy-related enquiries:
- Phone: 020 8858 1073
- Email: lch.loganspharmacy@nhs.net

---

Built with care for Logan Health
