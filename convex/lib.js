/**
 * convex/lib.js — Shared authentication helpers.
 *
 * Import these in every Convex function file that handles user data.
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
 * Like getAuthenticatedUser, but also verifies that the authenticated
 * user is the owner of the requested userId.
 *
 * Use in queries / mutations that accept a `userId` argument.
 */
export async function requireOwnUser(ctx, userId) {
  const user = await getAuthenticatedUser(ctx);
  if (user._id !== userId) throw new Error("Unauthorized");
  return user;
}
