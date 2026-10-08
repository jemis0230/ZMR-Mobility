"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

/** Shown when a public page's data request fails (e.g. the database is unreachable). */
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-cream flex items-center justify-center px-6 pt-24 lg:pt-36 pb-16">
      <div role="alert" className="max-w-md text-center">
        <h1 className="text-2xl md:text-3xl font-black text-forest">This page didn’t load</h1>
        <p className="mt-3 text-ink/75">
          We couldn’t fetch the latest information just now. Please try again — or call us on{" "}
          <a href="tel:+919045222999" className="font-semibold text-primary hover:underline">+91 90452 22999</a>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            <RefreshCw className="w-4 h-4" aria-hidden /> Try again
          </button>
          <Link href="/" className="rounded-xl border border-ink/20 bg-white px-5 py-2.5 text-sm font-bold text-forest hover:border-primary">
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
