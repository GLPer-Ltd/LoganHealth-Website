/* =============================================
   Logan Health - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    // Note: Scroll animations and counter animations are now handled by GSAP (gsap-animations.js)
    initNavigation();
    initSmoothScroll();
    initFAQ();
});

/* =============================================
   Navigation
   ============================================= */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Add scrolled class to navbar on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/* =============================================
   Smooth Scroll
   ============================================= */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();

                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* =============================================
   FAQ Accordion
   ============================================= */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            this.setAttribute('aria-expanded', !isActive);
        });
    });
}

/* =============================================
   Utility Functions
   ============================================= */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format phone number for display
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as UK phone number
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate UK phone number
function isValidUKPhone(phone) {
    const phoneRegex = /^(?:(?:\+44)|(?:0))(?:\d\s?){9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Export utilities for use in other modules
window.utils = {
    debounce,
    throttle,
    formatPhoneNumber,
    isValidEmail,
    isValidUKPhone
};

// Rotating review banner
(function initReviewBanner() {
    var reviews = [
        '"Excellent Service\u2026they go above and beyond\u2026very friendly and helpful, really great service" \u2014 Arthur A.',
        '"Fantastic service. Professional, kind, helpful, warm and just brilliant all around. Highly recommended!!" \u2014 Georgia A.',
        '"Always gone above and beyond\u2026friendly, efficient and have been really helpful" \u2014 Maisie B.',
        '"Very friendly and welcoming people. They just care for your health and take in mind your feelings" \u2014 Marcin L.',
        '"So helpful and knowledgeable, always willing to help out and provide advice" \u2014 Amanda D.',
        '"The team always delivers an exceptional experience" \u2014 Georgis P.',
        '"Logan health are really supportive and take time to understand your worries and concerns" \u2014 Ella A.'
    ];

    var bannerText = document.getElementById('reviewBannerText');
    if (!bannerText || reviews.length === 0) return;

    var currentIndex = 0;

    setInterval(function() {
        bannerText.style.opacity = '0';
        setTimeout(function() {
            currentIndex = (currentIndex + 1) % reviews.length;
            bannerText.textContent = reviews[currentIndex];
            bannerText.style.opacity = '1';
        }, 500);
    }, 5000);
})();
