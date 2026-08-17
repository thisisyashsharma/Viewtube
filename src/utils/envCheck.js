/**
 * Validates that essential environment variables are set.
 * Throws an error on missing critical secrets.
 */
export function validateEnvironment() {
  const requiredEnvVars = [
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "MONGODB_URI",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `FATAL: Missing critical environment variables: ${missing.join(", ")}. Check your .env file.`
    );
  }

  // Warn if using placeholder / default secret values
  const insecurePatterns = [
    "supersecretkey",
    "anothersecretkey",
    "your_super_secret",
    "test_access_secret",
    "changeme",
  ];

  for (const key of ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"]) {
    const val = (process.env[key] || "").toLowerCase();
    const isInsecure = insecurePatterns.some((p) => val.includes(p));
    const isTooShort = val.length < 32;

    if (isInsecure || isTooShort) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `FATAL: ${key} is insecure (too short or uses a known placeholder). Use a strong 32+ character random secret in production.`
        );
      } else {
        console.warn(
          `⚠️  WARNING: ${key} appears weak (${isTooShort ? "< 32 chars" : "matches placeholder pattern"}). Update it in .env for production.`
        );
      }
    }
  }

  // Validate CORS_ORIGIN is set in production
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    console.warn(
      "⚠️  WARNING: CORS_ORIGIN is not set. Defaulting to localhost. Set it to your production domain(s)."
    );
  }
}
