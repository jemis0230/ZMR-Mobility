import Navbar from "@/presentation/components/Navbar";
import Footer from "@/presentation/components/Footer";
import WhatsAppButton from "@/presentation/components/WhatsAppButton";
import { getCachedExploreMenuData } from "@/lib/cachedVehicleQueries";
import type { MakeWithModels } from "@/lib/explore";

async function loadMenuMakes(): Promise<MakeWithModels[]> {
  try {
    const { makes } = await getCachedExploreMenuData();
    return makes.map(({ make, models }) => ({ make, models }));
  } catch {
    // DB unavailable (e.g. during image build) — Navbar falls back to a static brand list
    return [];
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const makes = await loadMenuMakes();
  return (
    <>
      <Navbar makes={makes} />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
