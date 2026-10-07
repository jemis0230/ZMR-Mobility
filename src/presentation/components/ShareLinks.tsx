"use client";

import { useState } from "react";
import { Linkedin, Facebook, Link2, Check, MessageCircle } from "lucide-react";

/** Real share links (open in a new tab) plus copy-to-clipboard. */
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: () => <span aria-hidden className="text-sm font-black">𝕏</span> },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: Facebook },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: MessageCircle },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-black uppercase tracking-widest text-ink/75">Share this article:</span>
      <div className="flex gap-2">
        {links.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-forest hover:bg-lime transition-colors border border-ink/15">
            <Icon className="w-4 h-4" aria-hidden />
          </a>
        ))}
      </div>
      <button
        type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard blocked */ }
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-bold text-forest hover:border-primary"
      >
        {copied ? <Check className="w-4 h-4 text-primary" aria-hidden /> : <Link2 className="w-4 h-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy article link"}</span>
      </button>
    </div>
  );
}
