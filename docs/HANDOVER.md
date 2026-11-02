# ZMR Mobility website – handover

Prepared on 2 November 2026 for the ZMR Mobility team by Jemis Suhagiya (internship ends
13 November 2026), with Claude (AI assistant). No passwords, tokens or connection strings
appear in this document; they live only in the providers' secret settings.

## 1. Where everything is

| Item | Value |
|---|---|
| Repository | https://github.com/jemis0230/ZMR-Mobility (public; personal account of Jemis Suhagiya – see §15 Access transfer) |
| Original upstream | mohdhammad786/ZMRMobility (original developer, PlanxLabs) – not accessible from this handover session |
| Production branch | `main` (every merge to `main` deploys to Vercel Production) |
| Release (this handover) | Final release PR from branch `final-zmr-complete` (fresh admin sign-in, customer photos, presence interactions, lint clean-up) on top of PRs #20/#21. The exact merge commit is listed in GitHub → Pull requests and in Vercel → Deployments |
| Vercel | team `zmr1`, project `zmr-mobility` (Hobby plan at the time of writing) |
| Website (Vercel) | https://zmr-mobility.vercel.app/ |
| Company domain | https://zmrmobility.in/ – a **separate** website on the company's server; a GitHub merge does **not** update it (see §12) |
| Database | PostgreSQL on Neon (Vercel env `DATABASE_URL`); local/self-hosted: Docker Postgres |
| Open pull requests | None from this handover. #18 (fresh sign-in) and #19 (photos/presence) were incorporated into the final release PR and closed as superseded |

## 2. Technology

- Next.js 15.5.18 (App Router), React 18, TypeScript, Tailwind CSS 3.
- Prisma 5.22 ORM, PostgreSQL 16-compatible (Neon in production).
- Node.js 20 (Dockerfile) – Node 20 or 22 for local work.
- Auth: own email/password login, bcrypt hashes, signed session cookie (`jose`), 7-day
  sessions, per-account session version (sign-out ends sessions).
- Email via SMTP (nodemailer), WhatsApp Cloud API (Meta) for lead notifications.
- Images: Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; local disk when self-hosted.
- Excel export: `write-excel-file`.

## 3. Run, test and build locally

```
git clone https://github.com/jemis0230/ZMR-Mobility.git
cd ZMR-Mobility
npm ci
copy .env.example .env      (then fill DATABASE_URL and AUTH_SECRET for a LOCAL database)
npx prisma migrate deploy
npm run seed:demo           (optional demo catalogue – local databases only)
npm run dev                 (http://localhost:3000)
```

Checks before every merge:

```
npm test                 unit tests (node --test)
npx tsc --noEmit -p .    type check
npm run lint             (0 errors; 21 warnings – unused imports and <img> tags – remain)
npm run build            production build
```

Admin login locally: create an account with `node scripts/reset-admin-password.js you@example.com`
(prompts for a password; see docs/ADMIN_ACCESS.md).

## 4. Deploying

1. Create a branch, commit, push, open a pull request to `main`.
2. Vercel builds a **preview** for the PR (protected by Vercel login).
3. Merge when checks pass → Vercel builds **Production** with `scripts/vercel-build.js`:
   `prisma generate` → `prisma migrate deploy` (additive migrations) → first-admin check →
   `next build`. If a migration fails, the deployment fails and the previous version stays live.
4. Confirm in Vercel → Deployments that the new commit is "Ready".

**Rollback:** Vercel → Deployments → previous Production deployment → ⋯ → *Promote to
Production* (instant). Database migrations in this project only add tables/columns, so the
previous code keeps working with the newer schema.

## 5. Database

- Schema: `prisma/schema.prisma`; migrations: `prisma/migrations/*` (applied in order, never edited).
- Main tables: Vehicle (+ LeasePlan, RentPlan, brands/models), Lead, SellApplication,
  LeadNotification (outbox), BlogPost/BlogAuthor/BlogType/BlogTag, BlogPageView (analytics),
  Faq, PressMention, AdminUser, RateLimitBucket.
- **Backups (Neon):** point-in-time restore from the Neon console (retention depends on the
  plan). Before risky changes, create a Neon branch as a snapshot.
- **Backups (self-hosted Docker):** `scripts/backup.sh` (daily `pg_dump`, keeps 30) and
  `scripts/restore.sh` – see docs/DEPLOY-PRODUCTION.md.
- **Preview databases:** see docs/PREVIEW_DATABASE.md (needed only for end-to-end testing of
  schema changes on Vercel previews).

## 6. Environment variables (names only)

| Name | Purpose | Where |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection | Vercel (Production, Preview), local `.env` |
| `AUTH_SECRET` | signs admin session cookies (long random) | all |
| `SEED_ADMIN_PASSWORD` | first superadmin on an empty database only | optional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics tag (optional) | Production |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob image storage (set by connecting a Blob store) | Vercel |
| `APP_BASE_URL` | absolute links in notifications | Production |
| `CRON_SECRET` | protects the notification retry endpoint | Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `LEAD_EMAIL_FROM`, `LEAD_NOTIFY_EMAIL_TO` | lead email notifications | Production |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_LEAD_RECIPIENTS`, `WHATSAPP_LEAD_TEMPLATE`, `WHATSAPP_LEAD_TEMPLATE_LANGUAGE`, `WHATSAPP_GRAPH_API_VERSION`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | WhatsApp lead notifications + delivery webhook | Production |
| `PRODUCTION_DATABASE_HOST` | production DB host name (not a credential) – guards preview migrations | Production + Preview |
| `PREVIEW_DB_ISOLATED` | host of an isolated preview DB (branch-scoped Preview only) | Preview |
| `LEAD_NOTIFICATIONS_IN_PREVIEW` | `1` only to test delivery on a preview with test recipients | Preview (normally unset) |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DOMAIN` | Docker/self-hosted only | server `.env.production` |

## 7. Admin area

- URL: https://zmr-mobility.vercel.app/admin (More → Admin on the website).
- Roles: `SUPER_ADMIN` (everything, incl. Users) and `ADMIN` (content, vehicles, leads,
  analytics). Manage accounts in Admin → Users (superadmin).
- Login: email + password; 5 wrong attempts per account (20 per network) pause sign-in
  for 15 minutes. Sessions last 7 days; Sign out ends all of that account's sessions.
- **Account recovery:** a superadmin resets passwords in Admin → Users. If nobody can sign
  in: `node scripts/reset-admin-password.js email@company.com` with the production
  `DATABASE_URL` (docs/ADMIN_ACCESS.md).
- **Fresh sign-in:** More → Admin (and Admin in the mobile menu) always signs the current
  browser out and opens the sign-in page. It is a POST from the site itself (GET or other
  sites cannot sign anyone out); only that browser's session is revoked (table
  `RevokedSession`), other staff and devices stay signed in. Back/forward does not reopen
  the dashboard.

## 8. Leads, Excel export and notifications

- Website forms (contact, vehicle enquiry, test drive, sell EV) save leads first, then queue
  notifications (outbox) – a lead is never lost if email/WhatsApp fail.
- Admin → Leads: search, filters, status, notification status/retry, **Export to Excel**
  (filtered or all, .xlsx).
- Notification status at handover: **not configured** in production unless the SMTP/WhatsApp
  variables have since been set (Admin shows "Not set up"). Setup: docs/LEAD_NOTIFICATIONS.md.
- Retries: Vercel Cron once a day (Hobby limit) + immediately after each submission.
- Preview deployments never send notifications.

## 9. Blog publishing and analytics

- Admin → Manage Blogs: create/edit articles, tags, authors, types; publish when ready.
- Admin → Manage Blogs → **Blog Analytics**: views of published articles (per day in IST,
  per article, sources), date range. Definitions and privacy: docs/BLOG_ANALYTICS.md.
  Counting started with release `d56fc5c` (2 Nov 2026); no earlier data exists.

## 10. Website content rules (from the team)

- Purchase price range starts at ₹70,000 and stops at ₹3,00,000 (`src/lib/explore.ts`).
  Listings below ₹70,000 are hidden from the catalogue and flagged in Admin → Vehicles.
- Public phone: +91 92114 21514 – `src/lib/site.ts` (`SITE_PHONE*`); WhatsApp:
  `SITE_WHATSAPP_URL` (still the old number until confirmed).
- Operational cities (footer, city selector): `OPERATIONAL_CITIES` in `src/lib/site.ts`.
- Approved brands: Ather, Bajaj, Hero, BGauss, TVS (`src/lib/brands.ts`).
- Impact figures need a source before changing (docs/IMPACT_METRICS.md).
- Customer photos and approved location labels: `src/lib/customerPhotos.ts` + `public/customers/`.

## 11. Images

Uploads (vehicles, blogs, press) go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set;
without it, uploads on Vercel are refused (the server disk is temporary). Connect a Blob
store in Vercel → Storage if image uploads are needed. Static site images live in `public/`.

## 12. zmrmobility.in (company domain)

Separate deployment on the company server (Docker + Caddy, see docs/GO-LIVE.md and
docs/DEPLOY-PRODUCTION.md). It is **not** updated by GitHub merges or Vercel and was not
changed or verified in this handover. Updating it needs authorised server access and the
documented procedure.

## 13. Known issues and pending approvals

| Item | Status / owner action |
|---|---|
| WhatsApp number for the floating button | Confirm whether +91 92114 21514 has WhatsApp |
| Delhi NCR operational? | Confirm with management. The footer omits it; the presence map and About still show it as current (`src/lib/presence.ts`) – align once confirmed |
| "Powered by PlanxLabs" footer credit | Confirm the development agreement has no attribution clause |
| Impact figures, testimonials, partner logos, "certified", 48-hour claims | Company confirmation (see ZMR_Website_Content_Review.docx, issue register) |
| Landmark photos for Our Presence | Hover/tap/keyboard interactions are live; photos need licensed images (add to `src/lib/presenceLandmarks.ts`) |
| Isolated preview database | Not configured (needs Neon/Vercel access – docs/PREVIEW_DATABASE.md); previews built without it skip migrations |
| Notification providers (SMTP, WhatsApp), `CRON_SECRET`, `APP_BASE_URL` | Not configured |
| Vercel Blob store | Not connected (uploads refused on Vercel) |
| Database password rotation | Rotate the production database password in Neon as part of the access transfer, update `DATABASE_URL` in Vercel (Production), then redeploy |
| `npm audit` reports vulnerabilities in dependencies | Review with `npm audit`; update during a planned maintenance window |
| Lint warnings (21, no errors) | Unused imports and `<img>` tags; low risk |

## 14. Monitoring

- Vercel → Deployments / Logs (runtime errors, failed builds).
- Admin → Leads banner shows failed or not-configured notifications.
- `GET /api/admin/status` (signed in) lists applied migrations, image storage mode, commit.
- Neon console: database size, connections, restore points.

## 15. Third-party services and costs

| Service | Used for | Cost note |
|---|---|---|
| GitHub | source code | free (public repo) |
| Vercel | hosting, previews, cron | Hobby plan is for non-commercial use; a company site should move to a paid plan – check vercel.com/pricing |
| Neon | PostgreSQL | depends on plan; check the Neon billing page |
| Vercel Blob | image storage (when connected) | usage-based |
| Google Analytics | optional traffic analytics | free |
| SMTP provider | lead emails (not configured) | provider-dependent |
| Meta WhatsApp Cloud API | lead WhatsApp messages (not configured) | Meta per-conversation pricing |
| Domain zmrmobility.in + company server | official site | company-managed |

## 16. Access transfer checklist (for the company's authorised administrator)

Do these with the confirmed company owner – never by sharing a personal password.

1. **GitHub:** create/choose a company organisation; Jemis transfers `jemis0230/ZMR-Mobility`
   (Settings → Danger zone → Transfer) or adds the company admin as a collaborator with
   Admin rights. After transfer, reconnect the repository in Vercel (Project → Settings → Git).
2. **Vercel:** invite the company admin to team `zmr1` as **Owner**
   (Team → Settings → Members), then the company admin removes or downgrades personal accounts.
   Upgrade the plan if required for commercial use.
3. **Neon:** add the company admin to the Neon project/organisation; rotate the database
   password afterwards; update `DATABASE_URL` in Vercel.
4. **Website admin:** company superadmin creates their own account in Admin → Users, then
   deactivates accounts of people leaving (Jemis's included) – deactivation ends their sessions.
5. **Providers to hand over when set up:** SMTP mailbox, Meta Business/WhatsApp, Google Analytics
   property, domain registrar and the company server for zmrmobility.in.
6. Rotate `AUTH_SECRET` if anyone leaving had access to it (signs everyone out once).

## 17. Requested updates – status at handover

| Request | Status |
|---|---|
| Starting price range ₹70,000 | Done and verified locally; deployed (`d56fc5c`) |
| Replace customer photos (with pins) | Done – the five supplied originals, byte-identical, labels inside the images, no duplicate captions |
| Fresh login from More → Admin (PR #18) | Done and verified locally (desktop + mobile); merged in the final release |
| Presence city interactions (PR #19) | Done (hover/focus/tap/Enter, marker highlight); landmark photos pending |
| Lint errors | Fixed (0 errors) |
| Content review Word document | Done (source-based; live/database content not captured) |
| Dropdown colours to logo theme | Done and verified locally; deployed |
| Public number 92114 21514 | Done and verified locally; deployed (WhatsApp pending) |
| Footer operational cities | Done (Lucknow · Dehradun · Chennai · Bangalore); deployed |
| Blog analytics for admin/superadmin | Done and verified locally; deployed (counting from 2 Nov 2026) |
| PlanxLabs credit | Kept – agreement confirmation needed |
