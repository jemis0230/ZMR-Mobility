# Isolated preview databases (Vercel + Neon)

**What it is.** Every pull request gets a Vercel *preview* deployment. By default a
preview reads the database set for the Preview environment and never changes it. An
**isolated preview database** is a separate database used only by previews, so a pull
request that adds tables (a *migration*) can be tested end to end without touching
production data. A **Neon preview database** is one way to provide it: a Neon *branch*
(its own compute) holding an empty database.

**When it is needed.** Only for end-to-end testing of a pull request that changes the
database schema (for example new tables for blog analytics or session revocation) on
Vercel itself. Pages that do not use the new tables, and everything that can be tested
locally (`npm test`, lint, type check, production build, browser tests against a local
PostgreSQL), work without it.

## How the build decides (`scripts/vercel-build.js`)

| Environment | Conditions | What happens |
|---|---|---|
| Production | — | migrations + first-admin check |
| Preview | `PREVIEW_DB_ISOLATED` not set | no database changes |
| Preview | `PREVIEW_DB_ISOLATED` = host of this deployment's `DATABASE_URL`, `PRODUCTION_DATABASE_HOST` set and **different** | migrations only (no seeding) |
| Preview | anything else (`1`, a mismatch, `DATABASE_URL` = production host, `PRODUCTION_DATABASE_HOST` missing) | **build stops**, no database changes |

Two independent checks: the person enabling it must name the preview database host, and
the build compares the actual host with production's (`PRODUCTION_DATABASE_HOST`, a host
name only). The build log prints the host and database name it used, never credentials.

Preview deployments **never send lead notifications** (email/WhatsApp are treated as not
configured when `VERCEL_ENV=preview`), so test leads cannot reach real staff recipients.
Set `LEAD_NOTIFICATIONS_IN_PREVIEW=1` for Preview only, with test recipients, if delivery
itself must be tested.

## Setup (needs Neon and Vercel owner/admin access)

1. **Neon** (https://console.neon.tech, ZMR project): **Branches → Create branch**
   `preview` from `main` (check the plan's branch limits/costs first). On that branch,
   **Databases → New database** `zmr_preview` (empty: no customer or lead data copied).
   **Connect** → branch `preview`, database `zmr_preview`, pooling **off** → copy the
   connection string; note its host (between `@` and `/`).
2. **Vercel** (zmr-mobility → Settings → Environment Variables):

   | Key | Value | Environment |
   |---|---|---|
   | `PRODUCTION_DATABASE_HOST` | production's host (from the Production `DATABASE_URL`, e.g. `ep-…neon.tech`) | Production **and** Preview |
   | `DATABASE_URL` | the `zmr_preview` connection string (Sensitive) | **Preview**, Git branch = the PR branch |
   | `PREVIEW_DB_ISOLATED` | the preview host from step 1 | **Preview**, same Git branch |

   Leave Production's `DATABASE_URL` and the general Preview value untouched. Check
   `AUTH_SECRET` exists for Preview.
3. **Redeploy** the PR's latest deployment without build cache. The log must show
   `isolated database ep-…/zmr_preview confirmed; applying migrations`.
4. **Test admin** (only after step 3, from your computer):
   ```
   cd C:\Users\jemis\ZMR-Website-Work\ZMRMobility
   set "DATABASE_URL=<zmr_preview connection string>"
   node scripts/reset-admin-password.js your-email@example.com
   ```
   The `Database:` line must show the preview host and `/zmr_preview` before you type
   `YES`. Close the window afterwards.
5. **Clean up** after approval: remove the branch-specific variables; delete the Neon
   branch if no longer needed.
