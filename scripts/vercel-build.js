// Vercel build entry point (see vercel.json).
//
// Production builds apply pending migrations (additive, data is preserved) and make
// sure the initial admin user exists, then build. The demo catalogue seed is never
// run automatically; use `npm run seed:demo` deliberately on a local database.
//
// Preview builds never write to the database by default, because the Preview
// environment may share the production DATABASE_URL. They only apply migrations when
// the Preview environment has its own database AND PREVIEW_DB_ISOLATED is set to that
// database's host name (for example ep-quiet-wave-a1b2c3d4.c-4.ap-southeast-1.aws.neon.tech).
// Naming the host, instead of a plain "1", means the setting cannot silently apply to a
// different database (such as production) if DATABASE_URL changes later: on a mismatch
// the build stops before touching any database. Seed scripts never run on previews.
const { execSync } = require("node:child_process");

/** Host and database name of a connection string (never the user name or password). */
function describeDatabase(url) {
  try {
    const u = new URL(url);
    return { host: u.hostname, database: u.pathname.replace(/^\//, "") || "(default)" };
  } catch {
    return null;
  }
}

/**
 * What a build may do to the database.
 * @returns {{ action: "migrate-and-seed" | "migrate" | "skip" | "refuse", message: string }}
 */
function databasePlan(env) {
  const stage = env.VERCEL_ENV || "development";
  if (stage === "production") return { action: "migrate-and-seed", message: "production: applying migrations and checking the first admin." };

  const declared = (env.PREVIEW_DB_ISOLATED || "").trim();
  if (!declared) return { action: "skip", message: `${stage}: skipping migrations and seeding (database not declared isolated).` };

  const db = describeDatabase(env.DATABASE_URL || "");
  if (!db) return { action: "refuse", message: `${stage}: PREVIEW_DB_ISOLATED is set but DATABASE_URL is missing or invalid; not touching any database.` };
  if (declared !== db.host) {
    return {
      action: "refuse",
      message:
        `${stage}: PREVIEW_DB_ISOLATED does not match this deployment's database host, so no migrations were run. ` +
        `Set PREVIEW_DB_ISOLATED to the host of the isolated preview database (not "1", and never the production host).`,
    };
  }
  return { action: "migrate", message: `${stage}: isolated database ${db.host}/${db.database} confirmed; applying migrations (no seeding).` };
}

function main() {
  const run = (cmd) => {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
  };

  run("npx prisma generate");

  const plan = databasePlan(process.env);
  if (plan.action === "refuse") {
    console.error(`[vercel-build] ${plan.message}`);
    process.exit(1);
  }
  console.log(`[vercel-build] ${plan.message}`);
  if (plan.action !== "skip") run("npx prisma migrate deploy");
  if (plan.action === "migrate-and-seed") run("node prisma/seed-admin.js");

  run("npx next build");
}

if (require.main === module) main();

module.exports = { databasePlan, describeDatabase };
