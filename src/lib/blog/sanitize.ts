import sanitizeHtml from "sanitize-html";

// Article bodies come from the TipTap editor. Only the markup it produces is kept;
// scripts, event handlers, styles and unknown iframes are removed.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "del",
    "a", "ul", "ol", "li", "blockquote", "pre", "code", "span", "img", "figure", "figcaption",
    "div", "iframe", "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
    div: ["data-youtube-video"],
    code: ["class"],
    span: ["class"],
    pre: ["class"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedClasses: { code: [/^language-/, /^hljs/], span: [/^hljs/], pre: [/^language-/] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === "_blank" ? { ...attribs, rel: "noopener noreferrer" } : attribs,
    }),
  },
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}

/** Visible text length, used to require a body before publishing. */
export function textLength(html: string): number {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim().length;
}
