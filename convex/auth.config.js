/**
 * Convex authentication configuration for Clerk.
 *
 * The domain must match the Clerk JWT issuer URL.
 * Convex fetches {domain}/.well-known/openid-configuration to discover the JWKS endpoint.
 * The applicationID must match the JWT "aud" (audience) claim — Clerk sets this to "convex".
 */
export default {
  providers: [
    {
      domain: "https://easy-herring-30.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
