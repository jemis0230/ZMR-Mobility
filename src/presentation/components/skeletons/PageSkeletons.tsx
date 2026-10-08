// Placeholders shown while a database-backed page streams in. Each one mirrors the
// layout of its page so the real content replaces it without shifting the layout.

const block = "rounded-xl bg-ink/[0.07]";

export function ExploreSkeleton() {
  return (
    <main className="min-h-screen bg-cream" aria-busy="true" aria-label="Loading vehicles">
      <section className="pt-24 lg:pt-36 pb-8 px-4 md:px-6 bg-tint border-b border-ink/10">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className={`h-3 w-40 mb-4 ${block}`} />
          <div className={`h-9 md:h-10 w-80 max-w-full ${block}`} />
          <div className={`h-5 w-48 mt-3 ${block}`} />
          <div className="mt-6 flex gap-3">
            <div className="h-[52px] w-36 rounded-2xl bg-white border border-ink/10" />
            <div className="h-[52px] w-28 rounded-2xl bg-white border border-ink/10" />
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8 animate-pulse">
        <div className="hidden lg:block w-72 shrink-0 h-[640px] rounded-2xl bg-white border border-ink/10" />
        <div className="flex-1 min-w-0">
          <div className={`h-10 w-full mb-5 ${block}`} />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-ink/10 overflow-hidden">
                <div className="aspect-[4/3] bg-tint" />
                <div className="p-4 space-y-3">
                  <div className={`h-5 w-3/4 ${block}`} />
                  <div className={`h-4 w-1/2 ${block}`} />
                  <div className={`h-7 w-1/3 ${block}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function VehicleDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background" aria-busy="true" aria-label="Loading vehicle">
      <div className="pt-24 lg:pt-36 pb-20 px-6 max-w-7xl mx-auto animate-pulse">
        <div className={`h-3 w-56 mb-8 ${block}`} />
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <div>
            <div className="aspect-[4/3] rounded-3xl bg-ink/[0.06]" />
            <div className="mt-6 md:mt-10 grid grid-cols-2 gap-3 md:gap-6">
              <div className="h-32 rounded-2xl bg-white border border-ink/10" />
              <div className="h-32 rounded-2xl bg-white border border-ink/10" />
            </div>
          </div>
          <div className="space-y-6">
            <div className={`h-6 w-40 rounded-full bg-lime/40`} />
            <div className={`h-12 w-3/4 ${block}`} />
            <div className={`h-16 w-full ${block}`} />
            <div className="h-48 rounded-3xl bg-white border border-ink/10" />
            <div className="h-64 rounded-3xl bg-white border border-ink/10" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function SimplePageSkeleton({ label }: { label: string }) {
  return (
    <main className="min-h-screen bg-cream" aria-busy="true" aria-label={label}>
      <div className="pt-24 lg:pt-36 pb-20 px-4 md:px-6 max-w-7xl mx-auto animate-pulse">
        <div className={`h-3 w-32 mb-4 ${block}`} />
        <div className={`h-10 w-72 max-w-full ${block}`} />
        <div className={`h-5 w-96 max-w-full mt-3 ${block}`} />
        <div className="mt-8 h-[420px] rounded-3xl bg-white border border-ink/10" />
      </div>
    </main>
  );
}
