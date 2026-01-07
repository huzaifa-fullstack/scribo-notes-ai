// Sentry Instrumentation File
// This file must be imported at the very top of your application entry point (server.js)
// Official Sentry Guide: https://docs.sentry.io/platforms/javascript/guides/node/

// IMPORTANT: Load dotenv FIRST so SENTRY_DSN is available
require('dotenv').config();

const Sentry = require("@sentry/node");

// Only initialize if SENTRY_DSN is provided
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Environment and release tracking
        environment: process.env.NODE_ENV || 'development',
        release: `scribo-backend@${process.env.npm_package_version || '1.0.0'}`,

        // Setting this option to true will send default PII data to Sentry.
        // For example, automatic IP address collection on events
        sendDefaultPii: true,

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

        // Set sampling rate for profiling (relative to tracesSampleRate)
        profilesSampleRate: 0.1,

        // Filter sensitive data before sending to Sentry
        beforeSend(event) {
            // Skip test environment errors entirely
            if (process.env.NODE_ENV === 'test') {
                return null;
            }

            // Remove sensitive headers
            if (event.request && event.request.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
            }

            // Remove sensitive data from request body
            if (event.request && event.request.data) {
                try {
                    const data = typeof event.request.data === 'string'
                        ? JSON.parse(event.request.data)
                        : event.request.data;

                    if (data.password) data.password = '[FILTERED]';
                    if (data.token) data.token = '[FILTERED]';
                    if (data.refreshToken) data.refreshToken = '[FILTERED]';

                    event.request.data = JSON.stringify(data);
                } catch {
                    // JSON parse errors are expected for non-JSON data, safe to ignore
                }
            }

            return event;
        },

        // Ignore common non-error exceptions
        ignoreErrors: [
            'AxiosError',
            'Network Error',
            'ECONNREFUSED',
            'ECONNRESET',
            'ETIMEDOUT',
        ],
    });

    console.log('✅ Sentry error tracking initialized');
} else {
    console.log('ℹ️  Sentry: SENTRY_DSN not configured. Error tracking disabled.');
}

module.exports = Sentry;
