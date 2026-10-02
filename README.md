# ZMR Mobility — Website

Official website of **ZMR Mobility**, India's technology-first EV asset management company: buy, lease and rent certified electric 2W / 3W / 4W vehicles.

**Demo (Vercel):** https://zmr-mobility.vercel.app · **Production domain:** https://zmrmobility.in. It shows the new design only after this code is deployed to the company server; see [docs/DEPLOY-PRODUCTION.md](docs/DEPLOY-PRODUCTION.md) for the step-by-step server deployment and [docs/GO-LIVE.md](docs/GO-LIVE.md) for the overview and Google setup.

## Features

- Light-blue theme with a two-row header: city picker, search, Buy / Sell / More menus, and an **Explore By** bar (Price Range, Make and Model, Year, KM Driven, Body Type, Transmission, Range)
- `/explore`: certified pre-owned EV listing with filters, sorting and EMI estimates
- Leasing, buying and rent catalogues by category, vehicle detail pages, compare tool
- Sell-your-EV wizard, lead and contact forms, blog, FAQ
- Admin panel (`/admin`): vehicles (incl. manufacture year and KM driven), leads, sell applications, blogs, FAQs, EV catalogue, users
- SEO: sitemap, robots.txt, Open Graph image, Organization/WebSite structured data, Google Analytics 4

## Tech stack

Next.js 15 (App Router) · React 18 · Tailwind CSS · Prisma + PostgreSQL · Docker Compose + Caddy (auto-HTTPS)

## Run locally

```bash
npm install
cp .env.example .env            # set DATABASE_URL to a local Postgres, AUTH_SECRET, etc.
npx prisma migrate deploy       # create tables
node prisma/seed-admin.js       # first admin user
npm run seed:demo               # optional: 21 sample EVs for the explore filters
npm run dev                     # http://localhost:3000
```

## Deploy (VPS)

```bash
./setup.sh                                                   # first time
git pull && docker compose --env-file .env.production up -d --build   # updates
```

Database migrations run automatically when the app container starts. See [docs/GO-LIVE.md](docs/GO-LIVE.md) for the full checklist (backup, verification, security, Google Search Console).

## Project structure

```
src/app/(public)      public pages (home, explore, buying/leasing/rent, blogs, about, sell-ev)
src/app/admin         admin panel
src/presentation      UI components (Navbar, HeroBanner, HomeExplore, ExploreVehicleCard, …)
src/lib               shared config (explore filters, site info, schemas)
src/infrastructure    Prisma repositories
prisma                schema, migrations, seed scripts
```

> Never commit `.env` / `.env.production`; they hold passwords. Use `.env.example` as the template.
