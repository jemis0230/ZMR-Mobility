"use client";

import { useEffect, useRef } from "react";

/**
 * Counts one view of a published article (see docs/BLOG_ANALYTICS.md). Sent once per
 * article per browser tab session: a flag in sessionStorage (cleared when the tab
 * closes, never sent anywhere) stops reloads and re-renders from counting again. Only
 * the referring site's host name is sent, not the full address. No cookies.
 */
export default function BlogViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const key = `zmr-blog-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode etc.): still count this page load once.
    }
    let ref = "";
    try {
      ref = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      ref = "";
    }
    fetch("/api/blog-views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, ref }),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  }, [slug]);

  return null;
}
