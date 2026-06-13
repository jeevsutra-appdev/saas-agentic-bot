// Aether AI Server Sentry Config
export const initSentryServer = () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Initializing Sentry Server in Production...");
    // Sentry.init({ dsn: process.env.SENTRY_DSN });
  }
};
