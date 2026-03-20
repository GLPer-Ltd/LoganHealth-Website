/**
 * Booking page — handles two entry paths:
 * 1. ?session_id=xxx — after payment, verifies payment and resolves to token
 * 2. ?token=xxx — from backup email link
 */

(function() {
    'use strict';

    var WORKER_URL = 'https://loganhealth-payments.misty-heart-ac54.workers.dev';
    var MAX_POLL_ATTEMPTS = 10;
    var POLL_INTERVAL_MS = 2000;

    var loadingEl = document.getElementById('bookingLoading');
    var errorEl = document.getElementById('bookingError');
    var successEl = document.getElementById('bookingSuccess');
    var welcomeEl = document.getElementById('welcomeMessage');
    var calendlyWidget = document.getElementById('calendlyWidget');

    var currentToken = null;

    function showState(state) {
        loadingEl.classList.remove('active');
        errorEl.classList.remove('active');
        successEl.classList.remove('active');

        if (state === 'loading') loadingEl.classList.add('active');
        if (state === 'error') errorEl.classList.add('active');
        if (state === 'success') successEl.classList.add('active');
    }

    /**
     * Validate a token with the Worker
     */
    async function validateToken(token) {
        try {
            var response = await fetch(WORKER_URL + '/api/validate-token?token=' + encodeURIComponent(token), {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) return { valid: false };
            return await response.json();
        } catch (error) {
            console.error('Token validation error:', error);
            return { valid: false };
        }
    }

    /**
     * Resolve a session_id to a token by polling the payment-status endpoint.
     * The webhook may take a few seconds to process after Stripe redirects back.
     */
    async function resolveSessionToToken(sessionId) {
        for (var attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
            try {
                var response = await fetch(WORKER_URL + '/api/payment-status?session_id=' + encodeURIComponent(sessionId), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                });

                var data = await response.json();

                if (data.status === 'paid' && data.token) {
                    return data;
                }

                if (data.status === 'paid' && !data.token) {
                    // Payment confirmed but webhook hasn't created token yet — wait and retry
                    await new Promise(function(resolve) { setTimeout(resolve, POLL_INTERVAL_MS); });
                    continue;
                }

                if (data.status === 'pending') {
                    // Payment not yet confirmed — wait and retry
                    await new Promise(function(resolve) { setTimeout(resolve, POLL_INTERVAL_MS); });
                    continue;
                }
            } catch (error) {
                console.error('Payment status check error:', error);
                await new Promise(function(resolve) { setTimeout(resolve, POLL_INTERVAL_MS); });
            }
        }

        return null;
    }

    /**
     * Mark token as used after Calendly booking
     */
    async function markTokenUsed(token) {
        try {
            await fetch(WORKER_URL + '/api/mark-used?token=' + encodeURIComponent(token), {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
            });
        } catch (error) {
            console.error('Failed to mark token as used:', error);
        }
    }

    /**
     * Initialize Calendly with user data
     */
    function initializeCalendly(userData) {
        if (typeof Calendly === 'undefined') {
            setTimeout(function() { initializeCalendly(userData); }, 100);
            return;
        }

        var calendlyUrl = calendlyWidget.getAttribute('data-url');
        var prefillUrl = calendlyUrl;

        if (userData.name || userData.email) {
            var prefillParams = new URLSearchParams();
            if (userData.name) prefillParams.set('name', userData.name);
            if (userData.email) prefillParams.set('email', userData.email);
            prefillUrl = calendlyUrl + '?' + prefillParams.toString();
        }

        calendlyWidget.innerHTML = '';
        Calendly.initInlineWidget({
            url: prefillUrl,
            parentElement: calendlyWidget,
            prefill: {
                name: userData.name || '',
                email: userData.email || '',
            },
        });

        window.addEventListener('message', function(e) {
            if (e.data.event && e.data.event === 'calendly.event_scheduled') {
                if (currentToken) {
                    markTokenUsed(currentToken);
                }
            }
        });
    }

    /**
     * Show booking success with Calendly
     */
    function showBooking(name, email) {
        showState('success');

        if (name && welcomeEl) {
            var firstName = name.split(' ')[0];
            welcomeEl.textContent = 'Hi ' + firstName + '! Select a convenient time for your consultation with our pharmacist.';
        }

        initializeCalendly({ name: name, email: email });
    }

    /**
     * Main initialization
     */
    async function init() {
        var params = new URLSearchParams(window.location.search);
        var token = params.get('token');
        var sessionId = params.get('session_id');

        // Path 1: Direct token from email link
        if (token) {
            if (token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
                showState('error');
                return;
            }

            currentToken = token;
            var result = await validateToken(token);

            if (!result.valid) {
                showState('error');
                return;
            }

            showBooking(result.name, result.email);
            return;
        }

        // Path 2: Session ID from payment redirect
        if (sessionId) {
            if (!sessionId.startsWith('cs_')) {
                showState('error');
                return;
            }

            var resolved = await resolveSessionToToken(sessionId);

            if (!resolved || !resolved.token) {
                // Could not resolve — show error with suggestion to check email
                showState('error');
                var errorMsg = document.querySelector('#bookingError p');
                if (errorMsg) {
                    errorMsg.textContent = 'Your payment was successful but we\'re still processing your booking. Please check your email for a booking link, or refresh this page in a moment.';
                }
                return;
            }

            currentToken = resolved.token;
            showBooking(resolved.name, resolved.email);
            return;
        }

        // No token or session_id
        showState('error');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
