# ZMR Mobility — Go-Live Guide

This guide takes the redesigned website from GitHub to the live domain **https://zmrmobility.in**, then gets Google to show it when people search for "ZMR Mobility".

> **Read this first.** `zmrmobility.in` is ZMR Mobility's official, company-owned website, running on the company's server. Publishing it needs **permission and access from the company**: your internship supervisor, or whoever manages the server (the current site footer says it is built by *PlanxLabs*). Code on GitHub doesn't change the live site by itself. Someone with server access has to deploy it.
>
> No access yet? Do Part A, then use **Part F** to put up your own demo copy for your internship review.

---

## Part A — Get approval and access (you)

1. **Show the redesign to your supervisor.** Send them the GitHub pull request link and the screenshots, and ask for approval to publish it on zmrmobility.in.
2. **Ask for these four things** (or ask the server admin to do Part B for you):
   - **Server (VPS) access:** IP address, SSH username and password or key.
   - **Folder** on the server where the website is installed (for example `/root/ZMR-Mobility`).
   - **Which GitHub repository the server pulls from.** If it's the company's repository rather than `jemis0230/ZMR-Mobility`, the changes have to go there first (see step B3).
   - **Domain/DNS access** for `zmrmobility.in` (GoDaddy, Hostinger, Cloudflare, …). Part E needs it for Google verification.

## Part B — Deploy the new version to the server (you or the server admin)

The project already includes everything needed: Docker runs the app, PostgreSQL stores the data, and Caddy provides automatic HTTPS.

1. **Connect to the server**
   ```bash
   ssh <user>@<server-ip>
   cd <website-folder>          # e.g. cd ~/ZMR-Mobility
   ```
2. **Back up the database first** (keep this file safe)
   ```bash
   ./scripts/backup.sh          # or: docker compose exec backup ls /backups/
   ```
3. **Get the new code**
   ```bash
   git remote -v                # which repository does the server use?
   git pull                     # if it points to jemis0230/ZMR-Mobility
   ```
   If it points to the company's repository, open a pull request there with these changes (or ask the admin to merge them), then run `git pull`.
4. **Check the server's settings file** `.env.production`. It must contain these keys (see `.env.example`):
   `POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, AUTH_SECRET, SEED_ADMIN_PASSWORD, DOMAIN=zmrmobility.in, NEXT_PUBLIC_GA_MEASUREMENT_ID`.
   > `.env` is no longer stored in GitHub (it contained passwords and the repository is public). If the server has no `.env.production`, create it from `.env.example` with the real values.
5. **Rebuild and restart**
   ```bash
   docker compose --env-file .env.production up -d --build
   docker compose logs -f app    # wait for "Running database migrations…" then the server start; Ctrl+C to exit
   ```
   The database update for the new **Manufacture Year** and **KM Driven** fields is applied automatically on start.

## Part C — Check the live site (10 minutes)

Open each of these and confirm it works:

- [ ] https://zmrmobility.in — new light-blue design, banner, Explore By menu
- [ ] https://zmrmobility.in/explore — vehicle listing and filters
- [ ] https://zmrmobility.in/sitemap.xml and https://zmrmobility.in/robots.txt load
- [ ] https://zmrmobility.in/admin/login — admin can sign in
- [ ] On a phone: the menu button opens the slide-out menu

Then, in **Admin → Vehicles**, open each vehicle you sell and fill in **Manufacture Year** and **KM Driven**. Make sure **Show in Buying** is on. Only those vehicles appear on `/explore` and in the Year / KM Driven filters.

## Part D — Security clean-up (important)

The old `.env` file with real passwords was public on GitHub, so treat those passwords as leaked:

1. **Admin password:** sign in to `/admin` → **Settings** → change the password.
2. **AUTH_SECRET:** generate a new one with `openssl rand -base64 32`, put it in `.env.production`, then run step B5 again. Everyone is signed out once, which is expected.
3. **Database password:** change it inside Postgres **and** in `.env.production` at the same time:
   ```bash
   docker compose exec db psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c "ALTER USER <POSTGRES_USER> PASSWORD '<new-strong-password>';"
   # then update POSTGRES_PASSWORD in .env.production and run step B5
   ```
   The database port is now bound to the server only (`127.0.0.1`), so it can no longer be reached from the internet.

## Part E — Get the new site on Google

The new site uses the **same domain and the same page addresses** as the old one. Google doesn't need to "switch" sites: when it re-reads the pages it shows the new content. These steps make that happen sooner.

1. **Open Google Search Console:** https://search.google.com/search-console (sign in with the company Google account, the one used for Google Analytics if possible).
2. **Add property → Domain** → type `zmrmobility.in`.
3. **Verify ownership:** Google shows a `TXT` record. Add it in the domain's DNS settings (Part A access), wait a few minutes, then click **Verify**.
   *(No DNS access? Choose the "URL prefix" property instead, pick "HTML tag", copy the `content="…"` code, add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<code>` to `.env.production`, run step B5, then click Verify.)*
4. **Submit the sitemap:** go to **Sitemaps**, enter `sitemap.xml`, then **Submit**. This lists every page, including the new `/explore` pages, for Google.
5. **Request indexing:** go to **URL Inspection**, enter `https://zmrmobility.in/`, then **Request indexing**. Repeat for `https://zmrmobility.in/explore`.
6. **Check the brand data:** test the homepage at https://search.google.com/test/rich-results. It should detect **Organization** and **WebSite**, which describe the "ZMR Mobility" brand to Google.
7. **Google Business Profile** (strongly recommended for brand searches): https://business.google.com → add "ZMR Mobility" with the website, phone, cities and logo. This adds the business card on the right side of Google results.
8. **Link back to the site:** make sure LinkedIn, Instagram and any directory listings point to `https://zmrmobility.in`.

**How long it takes:** Google usually picks up the new homepage within **a few days to two weeks**. Search Console → **Pages** shows progress. Nothing else is needed; Google keeps re-checking the site automatically.

## Part F — No server access yet? Make your own demo for the internship

For an internship review you can show the site **without touching the official server**.

**Option 1: run it on your laptop** (needs Docker Desktop)
```bash
git clone https://github.com/jemis0230/ZMR-Mobility.git && cd ZMR-Mobility
cp .env.example .env.production      # fill in passwords; set DOMAIN=localhost
docker compose --env-file .env.production up -d --build
docker compose exec app node prisma/seed-demo.js   # optional sample vehicles
```
Open https://localhost and accept the self-signed certificate warning.

**Option 2: free online demo link** (Vercel + Neon)
1. Create a free Postgres database at https://neon.tech and copy its connection string.
2. Go to https://vercel.com, then **Add New → Project** and import `jemis0230/ZMR-Mobility`.
3. Set **Build Command** to `npx prisma generate && next build`, add these environment variables: `DATABASE_URL` (from Neon), `AUTH_SECRET` (any long random text), `SEED_ADMIN_PASSWORD`, then **Deploy**.
4. On your computer, run once against the Neon database:
   ```bash
   DATABASE_URL="<neon-url>" npx prisma migrate deploy
   DATABASE_URL="<neon-url>" node prisma/seed-admin.js
   DATABASE_URL="<neon-url>" node prisma/seed-demo.js
   ```
5. Share the `*.vercel.app` link. It's a **demo**; the official site remains zmrmobility.in. (Admin photo uploads don't persist on Vercel; that's fine for a demo.)

---

### Quick reference

| Task | Command / place |
|---|---|
| Redeploy after changes | `git pull && docker compose --env-file .env.production up -d --build` |
| App logs | `docker compose logs -f app` |
| Backups | `./scripts/backup.sh`, `./scripts/restore.sh <file>` |
| Add sample vehicles | `docker compose exec app node prisma/seed-demo.js` |
| Google status | Search Console → Pages / Sitemaps |
