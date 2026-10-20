import 'server-only';

// Notification settings come only from server-side environment variables (see
// .env.example). A channel is "configured" only when every setting it needs is present
// and valid; otherwise its notifications are recorded as NOT_CONFIGURED, never guessed.

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;
const E164_RE = /^\+[1-9]\d{7,14}$/;

const list = (v: string | undefined) => (v ?? '').split(',').map((x) => x.trim()).filter(Boolean);

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string[];
};

export function emailConfig(): EmailConfig | null {
  const e = process.env;
  const to = list(e.LEAD_NOTIFY_EMAIL_TO).filter((x) => EMAIL_RE.test(x));
  const from = (e.LEAD_EMAIL_FROM ?? '').trim();
  if (!e.SMTP_HOST || !e.SMTP_USER || !e.SMTP_PASSWORD || !from || to.length === 0) return null;
  const port = Number(e.SMTP_PORT || 465);
  return {
    host: e.SMTP_HOST,
    port,
    secure: e.SMTP_SECURE ? e.SMTP_SECURE === 'true' : port === 465,
    user: e.SMTP_USER,
    password: e.SMTP_PASSWORD,
    from,
    to,
  };
}

export type WhatsAppConfig = {
  phoneNumberId: string;
  accessToken: string;
  recipients: string[]; // E.164, e.g. +919876543210
  template: string;
  language: string;
  apiVersion: string;
  /** Graph API host; only overridden for local tests against a mock server. */
  apiBase: string;
};

export function whatsappConfig(): WhatsAppConfig | null {
  const e = process.env;
  const recipients = list(e.WHATSAPP_LEAD_RECIPIENTS).filter((x) => E164_RE.test(x));
  if (!e.WHATSAPP_PHONE_NUMBER_ID || !e.WHATSAPP_ACCESS_TOKEN || !e.WHATSAPP_LEAD_TEMPLATE || recipients.length === 0) return null;
  return {
    phoneNumberId: e.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: e.WHATSAPP_ACCESS_TOKEN,
    recipients,
    template: e.WHATSAPP_LEAD_TEMPLATE,
    language: e.WHATSAPP_LEAD_TEMPLATE_LANGUAGE || 'en',
    apiVersion: e.WHATSAPP_GRAPH_API_VERSION || 'v21.0',
    apiBase: (e.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com').replace(/\/+$/, ''),
  };
}

/** Base URL for links to the protected admin area in notifications. */
export function adminBaseUrl(): string {
  const explicit = process.env.APP_BASE_URL?.replace(/\/+$/, '');
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}

export const isValidEmail = (v: string) => EMAIL_RE.test(v);
