import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ExternalLink, Newspaper, Mail } from "lucide-react";
import { getPressMentions } from "@/app/actions/pressActions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Press & Media | ZMR Mobility",
  description: "News coverage and media mentions of ZMR Mobility, plus contact details for media enquiries.",
  alternates: { canonical: "/press" },
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function PressPage() {
  const mentions = await getPressMentions();

  return (
    <main className="min-h-screen bg-cream">
      <div className="pt-24 lg:pt-40 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-ink/70 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" aria-hidden />
          <span aria-current="page" className="text-forest">Press &amp; Media</span>
        </nav>

        <div className="max-w-3xl">
          <p className="text-primary text-xs font-bold uppercase tracking-widest">In the news</p>
          <h1 className="text-4xl md:text-5xl font-black mt-2 text-forest">Press &amp; Media</h1>
          <p className="text-ink/80 mt-3 text-lg leading-relaxed">Coverage of ZMR Mobility&apos;s work in electric mobility across India.</p>
        </div>

        {mentions.length > 0 ? (
          <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentions.map((m) => (
              <li key={m.id}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full rounded-2xl bg-white border border-ink/10 shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all overflow-hidden"
                >
                  <div className="relative aspect-[16/9] bg-tint flex items-center justify-center">
                    {m.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain p-6" />
                    ) : (
                      <span className="text-2xl font-black text-forest/70 px-6 text-center">{m.publication}</span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/75">
                      {m.publication}
                      {m.publishedAt && <> · <time dateTime={m.publishedAt}>{fmt(m.publishedAt)}</time></>}
                    </p>
                    <h2 className="mt-2 font-bold text-lg text-forest leading-snug group-hover:text-primary transition-colors">{m.title}</h2>
                    <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                      Read on {m.publication} <ExternalLink className="w-4 h-4" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl bg-white border border-dashed border-ink/20 py-16 px-6 text-center">
            <span className="w-14 h-14 mx-auto rounded-2xl bg-tint flex items-center justify-center mb-4">
              <Newspaper className="w-7 h-7 text-leaf" aria-hidden />
            </span>
            <h2 className="text-xl font-bold text-forest">Press coverage coming soon</h2>
            <p className="text-ink/75 text-sm mt-1 max-w-md mx-auto">
              We&apos;ll list articles about ZMR Mobility here as they are published.
            </p>
          </div>
        )}

        <section aria-labelledby="media-contact" className="mt-12 rounded-3xl bg-forest text-cream p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 focus-on-dark">
          <div>
            <h2 id="media-contact" className="text-2xl font-black text-cream">Media enquiries</h2>
            <p className="text-cream/85 mt-1">For interviews, information or images, contact our team.</p>
          </div>
          <a href="mailto:info@zmrmobility.in?subject=Media%20enquiry" className="inline-flex items-center gap-2 rounded-xl bg-lime text-forest px-6 py-3 font-bold hover:bg-white transition-colors">
            <Mail className="w-4 h-4" aria-hidden /> info@zmrmobility.in
          </a>
        </section>
      </div>
    </main>
  );
}
