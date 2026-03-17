/**
 * Payment page - Stripe integration
 * Handles card payment via Stripe Elements and the payments Worker
 */

(function() {
    'use strict';

    // Configuration
    const WORKER_URL = 'https://loganhealth-payments.misty-heart-ac54.workers.dev';
    const STRIPE_PUBLISHABLE_KEY = 'pk_test_XXXXX'; // Replace with real key

    // DOM Elements
    const paymentForm = document.getElementById('payment-form');
    const missingInfo = document.getElementById('missing-info');
    const customerNameEl = document.getElementById('customer-name');
    const customerEmailEl = document.getElementById('customer-email');
    const cardErrors = document.getElementById('card-errors');
    const payButton = document.getElementById('pay-button');
    const paymentLoading = document.getElementById('payment-loading');

    /**
     * Read query parameters from the URL
     */
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            name: params.get('name'),
            email: params.get('email'),
        };
    }

    /**
     * Show a card validation or payment error
     */
    function showError(message) {
        cardErrors.textContent = message;
        cardErrors.classList.add('visible');
    }

    /**
     * Hide the card error message
     */
    function hideError() {
        cardErrors.textContent = '';
        cardErrors.classList.remove('visible');
    }

    /**
     * Set the pay button to its processing state
     */
    function setProcessing(processing) {
        if (processing) {
            payButton.disabled = true;
            payButton.textContent = 'Processing\u2026';
            paymentLoading.classList.add('visible');
        } else {
            payButton.disabled = false;
            payButton.textContent = payButton.getAttribute('data-label');
            paymentLoading.classList.remove('visible');
        }
    }

    /**
     * Main initialisation
     */
    function init() {
        var _a = getQueryParams(), name = _a.name, email = _a.email;

        // If name or email is missing, show the error state
        if (!name || !email) {
            paymentForm.classList.add('hidden');
            missingInfo.classList.add('visible');
            return;
        }

        // Populate customer details
        customerNameEl.textContent = name;
        customerEmailEl.textContent = email;

        // Initialise Stripe
        var stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        var elements = stripe.elements({
            fonts: [
                { cssSrc: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap' }
            ],
        });

        var cardElement = elements.create('card', {
            style: {
                base: {
                    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: '16px',
                    color: '#1F2937',
                    '::placeholder': {
                        color: '#9CA3AF',
                    },
                },
                invalid: {
                    color: '#EF4444',
                    iconColor: '#EF4444',
                },
            },
        });

        cardElement.mount('#card-element');

        // Listen for card validation errors
        cardElement.on('change', function(event) {
            if (event.error) {
                showError(event.error.message);
            } else {
                hideError();
            }
        });

        // Handle pay button click
        payButton.addEventListener('click', async function() {
            hideError();
            setProcessing(true);

            try {
                // Step 1: Create a PaymentMethod
                var result = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: {
                        name: name,
                        email: email,
                    },
                });

                if (result.error) {
                    showError(result.error.message);
                    setProcessing(false);
                    return;
                }

                var paymentMethodId = result.paymentMethod.id;

                // Step 2: Send to Worker to create the payment
                var response = await fetch(WORKER_URL + '/api/create-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentMethodId: paymentMethodId,
                        name: name,
                        email: email,
                    }),
                });

                var data = await response.json();

                if (!response.ok) {
                    showError(data.error || 'Payment failed. Please try again.');
                    setProcessing(false);
                    return;
                }

                // Step 3: Handle 3D Secure if required
                if (data.requiresAction) {
                    var confirmResult = await stripe.confirmCardPayment(data.clientSecret);

                    if (confirmResult.error) {
                        showError(confirmResult.error.message);
                        setProcessing(false);
                        return;
                    }

                    if (confirmResult.paymentIntent.status === 'succeeded') {
                        window.location.href = 'payment-success.html';
                        return;
                    }

                    showError('Payment could not be completed. Please try again.');
                    setProcessing(false);
                    return;
                }

                // Step 4: Payment succeeded without 3D Secure
                if (data.success) {
                    window.location.href = 'payment-success.html';
                    return;
                }

                showError(data.error || 'Something went wrong. Please try again.');
                setProcessing(false);

            } catch (error) {
                console.error('Payment error:', error);
                showError('Unable to process your payment. Please check your connection and try again.');
                setProcessing(false);
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
