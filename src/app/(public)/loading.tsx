export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-pulse">
            <div className="h-6 w-52 rounded-full bg-white/5" />
            <div className="space-y-3">
              <div className="h-14 w-3/4 rounded-xl bg-white/[0.07]" />
              <div className="h-14 w-1/2 rounded-xl bg-white/[0.07]" />
            </div>
            <div className="h-20 rounded-xl bg-white/5" />
            <div className="flex gap-4">
              <div className="h-12 w-40 rounded-2xl bg-primary/20" />
              <div className="h-12 w-36 rounded-2xl bg-white/5" />
            </div>
          </div>
          <div className="hidden lg:block h-[560px] rounded-3xl bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
