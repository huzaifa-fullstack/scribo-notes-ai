/**
 * Sentry Test Button Component
 *
 * Use this component to test if Sentry error tracking is working.
 * Click the button to trigger a test error that will be sent to Sentry.
 *
 * Usage:
 * import { SentryTestButton } from '@/components/common/SentryTestButton';
 * <SentryTestButton />
 *
 * Remove this component from production once testing is complete.
 */

import * as Sentry from "@sentry/react";

export function SentryTestButton() {
  return (
    <button
      onClick={() => {
        throw new Error("This is your first Sentry error from React!");
      }}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Break the world (Test Sentry)
    </button>
  );
}

// Alternative: Capture error without crashing the app
export function SentryCaptureTestButton() {
  return (
    <button
      onClick={() => {
        try {
          throw new Error("This is a captured Sentry error from React!");
        } catch (error) {
          Sentry.captureException(error);
          console.log("Error captured and sent to Sentry!");
          alert(
            "Error captured and sent to Sentry! Check your Sentry dashboard."
          );
        }
      }}
      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
    >
      Capture Error (Test Sentry)
    </button>
  );
}
