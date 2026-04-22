/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as chat from "../chat.js";
import type * as family from "../family.js";
import type * as http from "../http.js";
import type * as lib from "../lib.js";
import type * as medications from "../medications.js";
import type * as notifications from "../notifications.js";
import type * as records from "../records.js";
import type * as users from "../users.js";
import type * as vitals from "../vitals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  chat: typeof chat;
  family: typeof family;
  http: typeof http;
  lib: typeof lib;
  medications: typeof medications;
  notifications: typeof notifications;
  records: typeof records;
  users: typeof users;
  vitals: typeof vitals;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
