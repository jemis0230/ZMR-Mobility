# Deploying the new ZMR website to zmrmobility.in (production runbook)

Follow these steps **in order**. Commands go in the **server terminal** unless a step says otherwise.
Expected time: about 30–45 minutes the first time.

> **Before you start:** you need permission from the company and these details from the server admin:
> - Server IP address, SSH username, and password or SSH key
> - The folder where the website lives on the server (e.g. `/root/ZMR-Mobility`)
> - Access to the domain's DNS panel (only needed for Google, Stage 8)

---

## Stage 1 — Connect to the server (from your Windows laptop)

**Option A — VS Code (easiest)**
1. In VS Code, open **Extensions** (Ctrl+Shift+X), search **Remote - SSH** (by Microsoft), click **Install**.
2. Press **F1** → type **Remote-SSH: Connect to Host…** → **Add New SSH Host…**
3. Type `ssh <username>@<server-ip>` (example: `ssh root@203.0.113.10`) → Enter → pick the first config file.
4. Press **F1** → **Remote-SSH: Connect to Host…** → choose the IP → platform **Linux** → enter the password.
5. When connected (bottom-left shows `SSH: <ip>`), open a terminal: **Terminal → New Terminal**.
6. **File → Open Folder…** → choose the website folder, so you can see the files.

**Option B — PowerShell**
```powershell
ssh <username>@<server-ip>
```
Type `yes` the first time, then the password (it won't show while typing — that's normal).

## Stage 2 — Go to the website folder and look around

```bash
cd ~/ZMR-Mobility            # use the real folder name; `ls` shows what's there
ls                           # you should see docker-compose.yml, Caddyfile, src, prisma …
git remote -v                # which GitHub repository the server uses
git status                   # any local changes?
docker compose ps            # running containers: db, app, caddy, backup
```

- If `git remote -v` shows `github.com/jemis0230/ZMR-Mobility` → continue normally.
- If it shows a **different** repository (e.g. the company's) → see **Appendix A** at Stage 4.
- If `docker compose ps` lists nothing, the site may use another folder — ask the admin.

## Stage 3 — Back up EVERYTHING (do not skip)

**3.1 Settings files**
```bash
mkdir -p ~/zmr-backup-$(date +%F)
cp -v .env* ~/zmr-backup-$(date +%F)/ 2>/dev/null
ls -la ~/zmr-backup-$(date +%F)
```
You should see `.env.production` (and maybe `.env`). This matters because the new code no longer stores `.env` in GitHub, so `git pull` may remove it.

**3.2 Database**
```bash
docker compose --env-file .env.production exec backup /bin/sh /backup.sh
docker compose --env-file .env.production exec backup ls -lh /backups/
```
Note the newest file name (e.g. `zmr_backup_20261002_101500.sql.gz`) and copy it out of Docker:
```bash
docker compose --env-file .env.production cp backup:/backups/<that-file-name> ~/zmr-backup-$(date +%F)/
```

**3.3 Uploaded photos**
```bash
docker volume ls | grep uploads          # e.g. zmr-mobility_uploads
docker run --rm -v <volume-name>:/data -v ~/zmr-backup-$(date +%F):/out alpine tar czf /out/uploads.tgz -C /data .
ls -lh ~/zmr-backup-$(date +%F)
```

**3.4 Remember the current version (for rollback)**
```bash
git log --oneline -1 | tee ~/zmr-backup-$(date +%F)/previous-commit.txt
```

## Stage 4 — Get the new code

```bash
git stash list                   # just to see; usually empty
git pull origin main
```

- **"Your local changes would be overwritten"** → someone edited files on the server. Save them, then pull:
  ```bash
  git stash
  git pull origin main
  ```
  (Your `.env` files are already backed up in Stage 3.)
- **"Permission denied / authentication failed"** → the repository is public, so this should not happen with HTTPS; if the remote uses SSH, run `git pull https://github.com/jemis0230/ZMR-Mobility.git main`.

Check it worked:
```bash
git log --oneline -3             # should mention "official ZMR Mobility logo"
ls docs                          # DEPLOY-PRODUCTION.md and GO-LIVE.md
```

**Appendix A — server uses a different repository**
Ask the admin which one is correct. To deploy this redesign anyway:
```bash
git remote add zmr-new https://github.com/jemis0230/ZMR-Mobility.git
git fetch zmr-new
git merge zmr-new/main           # if it says "refusing to merge unrelated histories", stop and ask the admin
```

## Stage 5 — Check the production settings file (.env.production)

```bash
ls -la .env.production || echo "MISSING"
nano .env.production
```
It must contain all of these lines (real values, no quotes needed):
```
POSTGRES_DB=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
AUTH_SECRET=...
SEED_ADMIN_PASSWORD=...
DOMAIN=zmrmobility.in
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```
- If `.env.production` is **missing**: `cp ~/zmr-backup-*/.env.production .` (or `cp ~/zmr-backup-*/.env .env.production`).
- **Never change POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB here** without Stage 9 — the existing database expects the old values.
- In nano: **Ctrl+O**, **Enter** to save, **Ctrl+X** to exit.

## Stage 6 — Rebuild and restart

```bash
docker compose --env-file .env.production up -d --build
```
This takes 3–10 minutes (it builds the new website). Then watch the app start:
```bash
docker compose --env-file .env.production logs -f app
```
Good signs:
```
→ Running database migrations...
Applying migration `20261001000000_add_year_km_driven`
→ Launching Next.js server...
✓ Ready
```
Press **Ctrl+C** to stop watching (the site keeps running). Then:
```bash
docker compose --env-file .env.production ps     # db, app, caddy, backup should all be "Up"/"running"
```

## Stage 7 — Test the live site

On your laptop, open these (press **Ctrl+F5** to bypass cache):
- [ ] https://zmrmobility.in — new light-blue design and official logo
- [ ] https://zmrmobility.in/explore — vehicle listing
- [ ] https://zmrmobility.in/sitemap.xml and https://zmrmobility.in/robots.txt
- [ ] https://zmrmobility.in/admin/login — log in with the existing admin account
- [ ] Phone: open the menu (☰) and the Explore By sections
- [ ] Submit the contact form once; check it appears in **Admin → Leads**

Then in **Admin → Vehicles**: for each vehicle for sale, fill **Manufacture Year** and **KM Driven**, and make sure **Show in Buying** is on (only those appear on `/explore`).

**Something wrong? Roll back in 5 minutes:**
```bash
git checkout $(cut -d' ' -f1 ~/zmr-backup-*/previous-commit.txt)
docker compose --env-file .env.production up -d --build
```
The database change only *adds* two optional columns, so the old version runs fine on it. Afterwards return to the new version with `git checkout main`.

## Stage 8 — Google Search Console

1. Open https://search.google.com/search-console with the **company** Google account.
2. **Add property** → **Domain** → `zmrmobility.in` → **Continue** → copy the **TXT** value.
3. In the domain's DNS panel (GoDaddy / Hostinger / Cloudflare …): **Add record** → Type `TXT`, Name `@`, Value = pasted text → Save.
4. Wait 5–30 min → **Verify**.
5. **Sitemaps** → enter `sitemap.xml` → **Submit**.
6. **URL Inspection** (top bar) → `https://zmrmobility.in/` → **Request indexing**. Repeat for `/explore` and `/about`.
7. Test https://search.google.com/test/rich-results with `https://zmrmobility.in` → should show **Organization** and **WebSite**.
8. **Google Business Profile** at https://business.google.com → "ZMR Mobility", website, phone, cities, official logo.

Google normally shows the new site within **2–14 days**; track it in Search Console → **Pages** and **Performance**.

## Stage 9 — Security clean-up (the old `.env` was public on GitHub)

**9.1 Admin password** — log in → **Admin → Settings** → change password.

**9.2 New AUTH_SECRET** (logs everyone out once):
```bash
openssl rand -base64 32          # copy the output
nano .env.production             # replace the AUTH_SECRET value, save
docker compose --env-file .env.production up -d app
```

**9.3 New database password** (do both parts back-to-back):
```bash
source .env.production
docker compose --env-file .env.production exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "ALTER USER \"$POSTGRES_USER\" PASSWORD 'NEW-STRONG-PASSWORD';"
nano .env.production             # set POSTGRES_PASSWORD=NEW-STRONG-PASSWORD, save
docker compose --env-file .env.production up -d
```

---

### Future updates (after the first deployment)

```bash
cd ~/ZMR-Mobility
docker compose --env-file .env.production exec backup /bin/sh /backup.sh
git pull origin main
docker compose --env-file .env.production up -d --build
```

### Useful commands

| Purpose | Command |
|---|---|
| Container status | `docker compose --env-file .env.production ps` |
| App logs | `docker compose --env-file .env.production logs -f app` |
| HTTPS / Caddy logs | `docker compose --env-file .env.production logs -f caddy` |
| Restart app only | `docker compose --env-file .env.production restart app` |
| List DB backups | `docker compose --env-file .env.production exec backup ls -lh /backups/` |
| Restore a DB backup | `./scripts/restore.sh <file-name>` |
| Free disk space | `docker system prune -f` |

### Troubleshooting

| Problem | Fix |
|---|---|
| Site still looks old | Ctrl+F5; check `git log -1` shows the new commit; re-run Stage 6 |
| `502 Bad Gateway` | App still starting or crashed → `logs -f app` and read the last red lines |
| `P1000 Authentication failed` in logs | `.env.production` DB password doesn't match the database → restore the backed-up `.env.production` |
| Build fails with "no space left on device" | `docker system prune -f`, then Stage 6 again |
| Admin login error | `AUTH_SECRET` missing in `.env.production` → add it, `up -d app` |
| HTTPS certificate error | `DOMAIN=zmrmobility.in` in `.env.production` and the domain's A record points to this server's IP |
