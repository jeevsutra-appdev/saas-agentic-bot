// Aether AI Client Sentry Config
export const initSentryClient = () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Initializing Sentry Client in Production...");
    // Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
  }
};
