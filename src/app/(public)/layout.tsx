import Navbar from "@/presentation/components/Navbar";
import Footer from "@/presentation/components/Footer";
import WhatsAppButton from "@/presentation/components/WhatsAppButton";
import CompareTray from "@/presentation/components/compare/CompareTray";
import { getCachedExploreMenuData } from "@/lib/cachedVehicleQueries";
import { buildPriceBuckets, DEFAULT_PRICE_BUCKETS, type ExploreNavData } from "@/lib/explore";

async function loadNavData(): Promise<ExploreNavData> {
  try {
    const { makes, prices } = await getCachedExploreMenuData();
    return {
      makes: makes.map(({ make, models, count }) => ({ make, models, count })),
      priceBuckets: buildPriceBuckets(prices),
    };
  } catch {
    // DB unavailable (e.g. during image build) — fall back to static menus
    return { makes: [], priceBuckets: DEFAULT_PRICE_BUCKETS };
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const nav = await loadNavData();
  return (
    <>
      <Navbar makes={nav.makes} priceBuckets={nav.priceBuckets} />
      <div id="main" tabIndex={-1} className="outline-none">{children}</div>
      <Footer priceBuckets={nav.priceBuckets} />
      <CompareTray />
      <WhatsAppButton />
    </>
  );
}
