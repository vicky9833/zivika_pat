/**
 * scripts/ensure-convex-stubs.js
 *
 * Ensures that the Convex _generated directory has at minimum the stub files
 * required for the Next.js build to succeed in CI/CD environments where
 * `npx convex dev` has not been run.
 *
 * This is registered as a `postinstall` script in package.json.
 * It is a no-op if the generated files already exist.
 */

const fs = require("fs");
const path = require("path");

const GENERATED_DIR = path.join(__dirname, "..", "convex", "_generated");

const STUBS = {
  "api.js": `/* auto-generated stub — run \`npx convex dev\` to regenerate */
export const api = {};
export const internal = {};
`,
  "api.d.ts": `/* auto-generated stub */
export declare const api: Record<string, unknown>;
export declare const internal: Record<string, unknown>;
`,
  "dataModel.d.ts": `/* auto-generated stub */
export type DataModel = Record<string, unknown>;
export type Id<T extends string> = string & { __tableName: T };
`,
  "react.js": `/* auto-generated stub */
export { useQuery, useMutation, useAction } from "convex/react";
`,
  "server.js": `/* auto-generated stub */
export { query, mutation, action, internalQuery, internalMutation, internalAction, httpAction } from "convex/server";
`,
};

function ensureStubs() {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    console.log("[ensure-convex-stubs] Created convex/_generated/");
  }

  let created = 0;
  for (const [filename, content] of Object.entries(STUBS)) {
    const filePath = path.join(GENERATED_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf-8");
      created++;
    }
  }

  if (created > 0) {
    console.log(
      `[ensure-convex-stubs] Wrote ${created} stub file(s) to convex/_generated/.` +
        "\n  Run \`npx convex dev\` to regenerate proper bindings."
    );
  }
}

ensureStubs();
