/**
 * Payment page — redirects to provider-hosted checkout
 * Reads name, email, product from URL params, calls Worker to create checkout session
 */
(function() {
    'use strict';

    const WORKER_URL = 'https://loganhealth-payments.misty-heart-ac54.workers.dev';

    const PRODUCT_NAMES = {
        wegovy: 'Wegovy (Semaglutide)',
        mounjaro: 'Mounjaro (Tirzepatide)',
    };

    const PRODUCT_PRICES = {
        wegovy: '£149',
        mounjaro: '£199',
    };

    function getQueryParams() {
        var params = new URLSearchParams(window.location.search);
        return {
            name: params.get('name'),
            email: params.get('email'),
            product: params.get('product'),
            cancelled: params.get('cancelled'),
        };
    }

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
        var params = getQueryParams();
        var name = params.name;
        var email = params.email;
        var product = params.product;

        var missingInfo = document.getElementById('missing-info');
        var paymentContent = document.getElementById('payment-content');

        // Show cancelled state if returning from cancelled checkout
        if (params.cancelled) {
            showError('Payment was cancelled. You can return to the questionnaire to try again.');
            var retryBtn = document.getElementById('retry-button');
            if (retryBtn) retryBtn.style.display = 'inline-flex';
            return;
        }

        // Show missing info state if required params absent
        if (!name || !email || !product || !PRODUCT_NAMES[product]) {
            if (paymentContent) paymentContent.style.display = 'none';
            if (missingInfo) missingInfo.style.display = 'block';
            return;
        }

        // Populate product details
        var productNameEl = document.getElementById('product-name');
        var productPriceEl = document.getElementById('product-price');
        var customerNameEl = document.getElementById('customer-name');
        if (productNameEl) productNameEl.textContent = PRODUCT_NAMES[product];
        if (productPriceEl) productPriceEl.textContent = PRODUCT_PRICES[product];
        if (customerNameEl) customerNameEl.textContent = name;

        // Create checkout session and redirect
        try {
            var response = await fetch(WORKER_URL + '/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, product: product }),
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
            showError('Unable to connect to payment service. Please check your connection and try again.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
