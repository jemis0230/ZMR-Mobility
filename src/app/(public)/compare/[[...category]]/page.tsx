import type { Metadata } from "next";
import { getCachedVehiclesByIds, getCachedVehicleSummaries } from "@/lib/cachedVehicleQueries";
import { SLUG_TO_CATEGORY, CATEGORY_DISPLAY } from "@/lib/constants";
import type { Vehicle } from "@/domain/entities/Vehicle";
import ComparePageClient, { type CatalogItem } from "./ComparePageClient";
import { COMPARE_MAX } from "@/lib/compare";


// Always read current inventory so availability is accurate.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Electric Vehicles | ZMR Mobility",
  description: "Compare up to 3 electric vehicles from ZMR Mobility's current inventory side by side — price, year, KM driven, battery, range, charging time, warranty and availability.",
  alternates: { canonical: "/compare" },
};

const isListed = (v: Vehicle) => v.showInBuying || v.showInLeasing || v.showInRent;

export default async function ComparePage(props: {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, sp] = await Promise.all([props.params, props.searchParams]);
  const categoryFilter = params.category?.[0] && SLUG_TO_CATEGORY[params.category[0]] ? SLUG_TO_CATEGORY[params.category[0]] : null;

  const rawIds = typeof sp.ids === "string" ? sp.ids : Array.isArray(sp.ids) ? sp.ids[0] : "";
  const ids = Array.from(new Set(rawIds.split(",").map((s) => s.trim()).filter((s) => /^[a-z0-9]{10,40}$/i.test(s)))).slice(0, COMPARE_MAX);

  let selected: Vehicle[] = [];
  let catalog: CatalogItem[] = [];
  let dbError = false;
  try {
    // Picker rows need only a few columns; full records (with images and plans) are
    // loaded just for the 2–3 vehicles being compared.
    const [found, all] = await Promise.all([
      ids.length ? getCachedVehiclesByIds(ids) : Promise.resolve([] as Vehicle[]),
      getCachedVehicleSummaries(),
    ]);
    selected = found.filter(isListed);
    catalog = all
      .map((v) => ({
        id: v.id,
        title: `${v.manufactureYear ? `${v.manufactureYear} ` : ""}${v.make} ${v.model}`,
        name: `${v.make} ${v.model}`,
        category: v.category,
        categoryLabel: CATEGORY_DISPLAY[v.category],
        image: v.mainImage,
      }))
      .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel) || a.title.localeCompare(b.title));
  } catch (error) {
    console.error("Compare page error:", error);
    dbError = true;
  }

  // Requested vehicles that were removed or are no longer listed.
  const unavailableIds = ids.filter((id) => !selected.some((v) => v.id === id));

  return (
    <ComparePageClient
      requestedIds={ids}
      vehicles={selected}
      unavailableIds={unavailableIds}
      catalog={catalog}
      categoryFilter={categoryFilter}
      dbError={dbError}
    />
  );
}
