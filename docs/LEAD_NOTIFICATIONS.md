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
4. Temporary failures (network errors, SMTP 4xx, WhatsApp 429/5xx) are retried after
   1 min, 5 min, 15 min, 1 h and 3 h (5 attempts); permanent errors (SMTP 5xx, WhatsApp
   4xx such as a template mismatch) are marked Failed for a staff Retry. Retries are run by
   the protected worker `/api/cron/notifications` (needs `CRON_SECRET`):
   - Vercel Cron (`vercel.json`): once a day on the Hobby plan; on a Pro plan change the
     schedule to `*/5 * * * *`.
   - GitHub Actions (`.github/workflows/lead-notification-worker.yml`): every 10 minutes,
     once the repository secret `CRON_SECRET` is set (same value as in Vercel).
   - Every new website lead also sends up to 5 other notifications that are due.
   - Self-hosted Docker: the `notifier` service calls it every 5 minutes.
5. Statuses: Queued → Sent (provider accepted) → Delivered / Read (WhatsApp webhook),
   or Failed / Not set up. Email and WhatsApp are separate rows, so retrying one channel
   never resends the other; within a channel, recipients that already received the
   message are skipped. Staff can retry Failed and Not set up rows. Leads saved while a
   channel was Not set up are **not** sent automatically once it is configured (to avoid
   a burst of old alerts); use Retry in Admin → Leads for the ones still needed.

"Sent" means the provider **accepted** the message. It is not proof of receipt: confirm
receipt in the inbox, and for WhatsApp via Delivered/Read (webhook) or on the phone.

## What staff receive

| | Email | WhatsApp |
| --- | --- | --- |
| Reference, received time (IST), enquiry type, vehicle | yes | yes |
| Customer name and phone | yes | yes |
| Customer email, location, preferred date, message, sell details | yes | no (open the lead) |
| Link to the lead in the admin area (sign-in required) | yes | yes |

Vehicle names for enquiries are read from the database by the server, never taken
from the visitor's browser.

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
(for example named `new_website_lead`, language English) with exactly these 7 variables:

```
New ZMR website lead {{1}}
Received: {{2}}
Enquiry: {{3}}
Vehicle: {{4}}
Name: {{5}}
Phone: {{6}}
Open the lead (staff sign-in required): {{7}}
```

Sample values for review: `ZMR-L-7K3QX9`, `14 Nov 2026, 3:05 pm IST`,
`Vehicle enquiry – Purchase`, `2023 Ather 450X`, `Customer name`, `9876543210`,
`https://zmr-mobility.vercel.app/admin/leads?q=ZMR-L-7K3QX9`.

Put the approved template's name in `WHATSAPP_LEAD_TEMPLATE` and its language code in
`WHATSAPP_LEAD_TEMPLATE_LANGUAGE`. A template with a different number of variables is
rejected by WhatsApp (error 132000) and shows as Failed in Admin → Leads.

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

## Setup checklist (project owner)

Never paste these values into chat, code or documents – only into the settings below.

| # | Setting | Where | Notes |
| --- | --- | --- | --- |
| 1 | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` | Vercel → Project `zmr-mobility` → Settings → Environment Variables → **Production** (mark the password Sensitive) | From the company mail provider (an app password if 2-step verification is on) |
| 2 | `LEAD_EMAIL_FROM` | same | A sender the SMTP account may send as, e.g. `ZMR Website <leads@zmrmobility.in>`; set SPF/DKIM for the domain at the DNS provider |
| 3 | `LEAD_NOTIFY_EMAIL_TO` | same | The approved ZMR inbox(es), comma-separated |
| 4 | Meta Business Manager: WhatsApp Business account, a business phone number, a permanent System User access token with `whatsapp_business_messaging` | business.facebook.com / developers.facebook.com | The sending number must not be one already used in the WhatsApp app |
| 5 | Template above approved | WhatsApp Manager → Message templates | Category Utility |
| 6 | `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_LEAD_TEMPLATE`, `WHATSAPP_LEAD_TEMPLATE_LANGUAGE` | Vercel → Production | Token marked Sensitive |
| 7 | `WHATSAPP_LEAD_RECIPIENTS` | Vercel → Production | The approved internal staff number(s) in `+91…` format – separate from the public website number; the staff member must agree to receive the alerts |
| 8 | `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` + webhook `https://zmr-mobility.vercel.app/api/webhooks/whatsapp` (field `messages`) | Vercel → Production; Meta app → WhatsApp → Configuration | Optional; gives Delivered/Read |
| 9 | `CRON_SECRET` (long random value) and `APP_BASE_URL=https://zmr-mobility.vercel.app` | Vercel → Production | Required for retries and correct links |
| 10 | Repository secret `CRON_SECRET` (same value) | GitHub → Settings → Secrets and variables → Actions | Enables the 10-minute retry worker |
| 11 | Redeploy | Vercel → Deployments → latest Production → Redeploy | Environment changes apply only to new deployments |
| 12 | One test lead labelled `TEST – please ignore` | Website contact form | Check the inbox and the staff phone separately; then check Admin → Leads shows Sent/Delivered for each channel |

Preview deployments never send notifications unless `LEAD_NOTIFICATIONS_IN_PREVIEW=1` is
set for Preview together with test recipients.
