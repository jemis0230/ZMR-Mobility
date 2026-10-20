# Lead notifications (email and WhatsApp)

Every website lead is saved first, then staff are notified by email and WhatsApp.
A notification problem never loses a lead: it stays in **Admin → Leads & Contacts**
with its delivery status, and staff can press **Retry**.

## Which forms notify staff

| Form | Saved as | Reference |
| --- | --- | --- |
| Contact Us (home page) | Lead, form "Contact Us form" | `ZMR-L-XXXXXX` |
| Buy / Lease / Rent enquiry on vehicle pages | Lead, form "Vehicle enquiry" | `ZMR-L-XXXXXX` |
| Test Drive | Lead, form "Test drive" | `ZMR-L-XXXXXX` |
| Sell Your EV | Sell application | `ZMR-SELL-XXXXXXXX` |

## How delivery works

1. The form is validated on the server, rate-limited per IP (8 per 10 minutes) and
   checked with a hidden honeypot field.
2. The lead and one notification row per channel are saved in one database transaction.
   A repeat submission (same phone, same form, within 10 minutes) returns the existing
   lead and sends nothing new.
3. Right after the visitor's confirmation is returned, the app sends the notifications.
4. Temporary failures are retried after 1 min, 5 min, 15 min, 1 h and 3 h (5 attempts),
   by the scheduled worker `/api/cron/notifications`:
   - Vercel: Vercel Cron (`vercel.json`). The Hobby plan allows one run per day; on a
     Pro plan change the schedule to `*/5 * * * *`.
   - Self-hosted Docker: the `notifier` service calls it every 5 minutes.
5. Statuses: Queued → Sent (provider accepted) → Delivered / Read (WhatsApp webhook),
   or Failed / Not set up. Staff can retry Failed and Not set up rows; recipients that
   already received a message are skipped, so a retry never duplicates it.

## Settings (server environment variables only — never in code)

See `.env.example` for every name. Email needs `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
`SMTP_USER`, `SMTP_PASSWORD`, `LEAD_EMAIL_FROM`, `LEAD_NOTIFY_EMAIL_TO`. WhatsApp needs
`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_LEAD_RECIPIENTS`,
`WHATSAPP_LEAD_TEMPLATE` (+ language), and for delivery statuses
`WHATSAPP_WEBHOOK_VERIFY_TOKEN` and `WHATSAPP_APP_SECRET`. The worker needs
`CRON_SECRET`; links in notifications use `APP_BASE_URL`.

A channel with missing settings is shown as **Not set up**; nothing is guessed.

## WhatsApp template to submit for approval

Business-initiated messages need an approved template. Create a **Utility** template
(for example named `new_website_lead`, language English) with this body:

```
New website lead {{1}}
Form: {{2}}
Name: {{3}}
Phone: {{4}}
Open in admin (sign-in required): {{5}}
```

Sample values for review: `ZMR-L-7K3QX9`, `Test drive request`, `Customer name`,
`9876543210`, `https://zmr-mobility.vercel.app/admin/leads?q=ZMR-L-7K3QX9`.

The recipients must be staff numbers that have agreed to receive these messages.
Customers are never messaged by this feature.

Webhook (optional, for Delivered/Read): in the Meta app, set the callback URL to
`https://<site>/api/webhooks/whatsapp`, the verify token to `WHATSAPP_WEBHOOK_VERIFY_TOKEN`,
and subscribe to `messages`.

## Self-hosted server (zmrmobility.in, if it runs this repository with Docker)

```
cd /path/to/ZMRMobility
git pull
# add CRON_SECRET and the SMTP_/LEAD_/WHATSAPP_ values to .env
docker compose up -d --build
docker compose logs -f app   # migrations run automatically at start
```
