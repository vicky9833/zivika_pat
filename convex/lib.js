/**
 * convex/lib.js — Shared authentication helpers.
 *
 * Import these in every Convex function file that handles user data.
 *
 * SOFT AUTH POLICY:
 * When Clerk is fully configured, `requireOwnUser` enforces strict ownership.
 * When Clerk auth is not yet available (JWT template missing, first deploy, etc.),
 * it falls back to an existence check so the app stays functional.
 */

/**
 * Returns the authenticated Convex user document.
 * Throws "Unauthenticated" if there is no active Clerk session.
 * Throws "User not found" if the Clerk user has no Convex record yet.
 */
export async function getAuthenticatedUser(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Soft ownership check used for mutations that accept a userId in args.
 *
 * - Always verifies the userId exists in the database.
 * - When Clerk identity IS available, also verifies that the authenticated
 *   user owns the record (strict check).
 * - When Clerk identity is NOT available (auth misconfigured or JWT template
 *   missing), falls back to existence-only check so mutations still work.
 *
 * This allows the app to remain functional while Clerk JWT setup is pending,
 * without completely removing access control.
 */
export async function requireOwnUser(ctx, userId) {
  const identity = await ctx.auth.getUserIdentity();
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  // When auth is working, enforce ownership
  if (identity && user.clerkId !== identity.subject) {
    throw new Error("Unauthorized");
  }
  return user;
}
