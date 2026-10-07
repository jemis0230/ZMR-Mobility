// Vercel build entry point (see vercel.json).
//
// Production builds apply pending migrations (additive, data is preserved) and make
// sure the initial admin user exists, then build. The demo catalogue seed is never
// run automatically; use `npm run seed:demo` deliberately on a local database.
//
// Preview builds never write to the database by default, because the Preview
// environment may share the production DATABASE_URL. They only apply migrations
// when the Preview environment has its own database and PREVIEW_DB_ISOLATED=1 is
// set for Preview in Vercel. Seed scripts never run on previews.
const { execSync } = require("node:child_process");

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

const env = process.env.VERCEL_ENV || "development";

run("npx prisma generate");

if (env === "production") {
  run("npx prisma migrate deploy");
  run("node prisma/seed-admin.js");
} else if (process.env.PREVIEW_DB_ISOLATED === "1") {
  console.log(`[vercel-build] ${env}: isolated database declared, applying migrations (no seeding).`);
  run("npx prisma migrate deploy");
} else {
  console.log(`[vercel-build] ${env}: skipping migrations and seeding (database not declared isolated).`);
}

run("npx next build");
