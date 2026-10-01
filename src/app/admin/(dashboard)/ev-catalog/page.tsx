import { getAllBrandsAdmin, getAllModelsAdmin } from '@/app/actions/evCatalogActions';
import EvCatalogClient from './EvCatalogClient';

export default async function EvCatalogPage() {
  const [brandsResult, modelsResult] = await Promise.all([
    getAllBrandsAdmin(),
    getAllModelsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">EV Catalog</h1>
        <p className="text-ink/60 text-sm mt-1">
          Manage brands and models shown in the Sell Your EV wizard.
        </p>
      </div>

      <EvCatalogClient
        initialBrands={brandsResult.data ?? []}
        initialModels={modelsResult.data ?? []}
        dbError={!brandsResult.success}
      />
    </div>
  );
}
