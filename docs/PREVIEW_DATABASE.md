# Testing a pull request on an isolated preview database

Use this when a pull request changes the database (for example PR #18 adds the
`RevokedSession` table). Preview builds only create tables when they have their **own**
database; they never touch production.

How the build decides (`scripts/vercel-build.js`):

| Environment | `PREVIEW_DB_ISOLATED` | What happens |
|---|---|---|
| Production | (ignored) | migrations + first-admin check |
| Preview | not set | no database changes |
| Preview | equals the host of this deployment's `DATABASE_URL` | migrations only (no seeding) |
| Preview | anything else (including `1`) | **build stops**, no database changes |

The build log shows the database host and name it used (never the password).

## 1. Neon: create an empty, isolated database

1. Open the ZMR project at https://console.neon.tech.
2. **Branches → Create branch**, name it e.g. `preview-pr18`, parent `main`.
   (A branch has its own compute, so tests never load the production database.)
3. On that branch: **Databases → New database**, name `zmr_preview`.
   An empty database means no customer or lead data is copied into the preview.
4. **Connect** → choose branch `preview-pr18`, database `zmr_preview`, **connection
   pooling off** → copy the connection string. Note its host (the part after `@` and
   before `/`, e.g. `ep-…neon.tech`). Check it is **not** the production host.

## 2. Vercel: set it for this pull request's branch only

**zmr-mobility → Settings → Environment Variables → Add**

| Key | Value | Environment |
|---|---|---|
| `DATABASE_URL` | the `zmr_preview` connection string | **Preview**, Git branch `claude/practical-maxwell-9iqq4m` |
| `PREVIEW_DB_ISOLATED` | the host from step 1.4 | **Preview**, same Git branch |

Choose "Preview" and enter the branch name, so other previews and Production keep
their current values. Mark `DATABASE_URL` as Sensitive. Do not edit the existing
Production or general Preview `DATABASE_URL`.

Check that `AUTH_SECRET` exists for Preview (any long random value; it may differ from
production).

## 3. Redeploy and check the log

**Deployments** → latest deployment of branch `claude/practical-maxwell-9iqq4m` → **⋯ →
Redeploy** (untick "use existing build cache"). In the build log look for:

```
[vercel-build] preview: isolated database ep-…/zmr_preview confirmed; applying migrations (no seeding).
```

followed by the migrations being applied. If it says the host does not match, nothing
was changed — correct the variables and redeploy.

## 4. Create a test admin in the preview database

Only after step 3 succeeded (the tables must exist). On your computer, in a new Command
Prompt, with the **preview** connection string — the same tool used for the production
login, no branch switch needed:

```
cd C:\Users\jemis\ZMR-Website-Work\ZMRMobility
set "DATABASE_URL=<zmr_preview connection string>"
node scripts/reset-admin-password.js your-email@example.com
```

Check the `Database:` line shows the **preview** host and `/zmr_preview` (not the
production host) before typing a password twice and `YES`. Close the window afterwards.
This account exists only in the preview database.

## 5. Clean up after approval

Delete the two branch-specific variables in Vercel and the `preview-pr18` branch in Neon.
