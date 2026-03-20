/**
 * Payment page — reads checkout data from sessionStorage, calls Worker, redirects to provider checkout
 */
(function() {
    'use strict';

    var WORKER_URL = 'https://loganhealth-payments.misty-heart-ac54.workers.dev';

    var PRODUCT_NAMES = {
        wegovy: 'Wegovy (Semaglutide)',
        mounjaro: 'Mounjaro (Tirzepatide)',
    };

    var PRODUCT_PRICES = {
        wegovy: '£149',
        mounjaro: '£199',
    };

    function showError(message) {
        var errorEl = document.getElementById('payment-error');
        var loadingEl = document.getElementById('payment-loading');
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    async function init() {
        var missingInfo = document.getElementById('missing-info');
        var paymentContent = document.getElementById('payment-content');

        // Check for cancelled return from provider
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('cancelled')) {
            showError('Payment was cancelled. You can return to the questionnaire to try again.');
            var retryBtn = document.getElementById('retry-button');
            if (retryBtn) retryBtn.style.display = 'inline-flex';
            return;
        }

        // Read checkout data from sessionStorage
        var checkoutData = null;
        try { checkoutData = JSON.parse(sessionStorage.getItem('lh_checkout')); } catch (e) {}

        if (!checkoutData || !checkoutData.name || !checkoutData.email || !checkoutData.product) {
            if (paymentContent) paymentContent.style.display = 'none';
            if (missingInfo) missingInfo.style.display = 'block';
            return;
        }

        var name = checkoutData.name;
        var product = checkoutData.product;

        // Populate product details
        var productNameEl = document.getElementById('product-name');
        var productPriceEl = document.getElementById('product-price');
        var customerNameEl = document.getElementById('customer-name');
        if (productNameEl) productNameEl.textContent = PRODUCT_NAMES[product] || product;
        if (productPriceEl) productPriceEl.textContent = PRODUCT_PRICES[product] || '';
        if (customerNameEl) customerNameEl.textContent = name;

        // Create checkout session and redirect
        try {
            var response = await fetch(WORKER_URL + '/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: checkoutData.name,
                    email: checkoutData.email,
                    phone: checkoutData.phone,
                    product: checkoutData.product,
                    questionnaireData: checkoutData.questionnaireData,
                    eligible: checkoutData.eligible,
                    eligibilityReason: checkoutData.eligibilityReason,
                    marketing: checkoutData.marketing,
                }),
            });

            var data = await response.json();

            if (!response.ok || !data.checkoutUrl) {
                showError(data.error || 'Unable to start checkout. Please try again.');
                return;
            }

            // Redirect to provider-hosted checkout
            window.location.href = data.checkoutUrl;
        } catch (error) {
            console.error('Checkout error:', error);
            // If on HTTP, the CORS preflight will fail — nudge to HTTPS
            if (window.location.protocol === 'http:') {
                window.location.href = window.location.href.replace('http:', 'https:');
                return;
            }
            showError('Unable to connect to payment service. Please check your connection and try again.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
