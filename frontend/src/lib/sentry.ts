/**
 * Sentry Error Tracking Configuration for Frontend
 * Official Guide: https://docs.sentry.io/platforms/javascript/guides/react/
 *
 * To use Sentry:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project (React)
 * 3. Get your DSN from Project Settings > Client Keys
 * 4. Set the VITE_SENTRY_DSN environment variable
 */

import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.log(
      "ℹ️  Sentry: VITE_SENTRY_DSN not configured. Error tracking disabled."
    );
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    environment: import.meta.env.MODE || "development",
    release: `scribo-frontend@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Performance Monitoring - capture 10% of transactions in production
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,

    // Session Replay - capture 10% of sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
  });

  console.log("✅ Sentry error tracking initialized");
};

// Set user context when user logs in
export const setUser = (
  user: { id: string; email: string; name?: string } | null
) => {
  if (SENTRY_DSN && user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
};

// Clear user context when user logs out
export const clearUser = () => {
  if (SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

// Error boundary component for React
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Re-export Sentry for advanced usage
export default Sentry;
