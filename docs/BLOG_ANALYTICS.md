# Blog analytics

**Where:** Admin → Manage Blogs → **Blog Analytics** (`/admin/blogs/analytics`).
Visible to every signed-in, active staff account — the two roles in this project,
`ADMIN` and `SUPER_ADMIN`. Public visitors cannot open the page (middleware + server
session check) and there is no public reporting API.

## What is measured

| Metric | Definition |
|---|---|
| Article views | Counted page loads of **published** articles in the date range (see rules below). |
| Views per day | Article views grouped by calendar day in **IST (UTC+05:30)**. |
| Views by article | Article views per article, most viewed first; every published article is listed (0 if none). |
| Articles viewed | Articles with at least one view in the range. |
| Published articles | Articles published right now (not range-dependent). |
| Counting since | Time of the first recorded view. |
| Where readers came from | Coarse type of the referring site: search engines, social/messaging, this website, other sites, direct/unknown. |

Not measured: unique people, sessions, time on page, location, device. A view is a page
load, not a person.

## Counting rules

- Sent by the article page's script (`BlogViewTracker`) after the page loads; pages that
  return "not found" (drafts, deleted articles) never send it, and the server re-checks
  that the article is published.
- **Repeat visits:** at most one view per article per browser tab session — a flag in
  `sessionStorage` (cleared when the tab closes, never sent to the server). Re-renders
  and reloads in the same tab do not add views; a new tab or another device does.
- **Staff:** requests from a signed-in staff session are not counted.
- **Bots:** requests without a user agent or from known crawlers, link-preview fetchers,
  monitors and automation tools are ignored; most simple bots do not run the script.
  Sophisticated bots that run JavaScript can still be counted — a known limitation.
- **Abuse protection:** same-site requests only, body ≤ 1 KB, slug validated, at most
  60 counted views per connection per 10 minutes (keyed by a one-way hash of the IP).

## Privacy

Stored per view: article id, UTC timestamp, referrer type. **No** IP address, user agent,
cookie, visitor identifier, name or email. No third-party service is involved. (The
separate Google Analytics tag runs only if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; its
data is not part of this report.) Consider mentioning first-party, cookieless view
counting in the Privacy Policy.

## History

Counting starts when this release is deployed. There is no earlier first-party data and
nothing is back-filled. Views of an article are deleted with the article.

## Data

Table `BlogPageView` (migration `20261102000000_blog_page_views`, additive). Code:
`src/lib/blog/viewRules.ts` (rules, tested by `npm test`), `src/lib/blog/analytics.ts`,
`src/app/api/blog-views/route.ts`, `src/app/admin/(dashboard)/blogs/analytics/page.tsx`.
