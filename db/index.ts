import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// `cloudflare:workers` only exists inside the Workers runtime, so it must be
// imported lazily — a top-level import crashes `next build`'s page-data
// collection step, which runs route modules in plain Node.
export async function getDb() {
  let env: { DB?: import("drizzle-orm/d1").AnyD1Database };
  try {
    ({ env } = await import("cloudflare:workers"));
  } catch {
    throw new Error(
      "Cloudflare D1 is unavailable outside the Workers runtime. Run the site through the platform (or `vinext`/wrangler dev) to use the database."
    );
  }

  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}
