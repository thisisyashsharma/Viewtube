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
  if (
    process.env.ACCESS_TOKEN_SECRET === "supersecretkey" ||
    process.env.REFRESH_TOKEN_SECRET === "anothersecretkey"
  ) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: Insecure default JWT secrets detected in production environment!"
      );
    } else {
      console.warn(
        "⚠️ WARNING: Using default development JWT secrets. Update ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET in .env for production."
      );
    }
  }
}
