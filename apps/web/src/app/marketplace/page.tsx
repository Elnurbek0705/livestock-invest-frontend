import { getApiClient } from "@livestock-invest/api-client";
import type { Livestock } from "@livestock-invest/shared-types";
import { MarketplaceClient } from "./MarketplaceClient";

export default async function MarketplacePage() {
  let listings: Livestock[] = [];
  let loadError: string | null = null;

  try {
    const api = getApiClient();
    listings = await api.livestock.list({ status: "listed" });
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Ma'lumotlarni yuklab bo'lmadi. Backend ishga tushganiga ishonch hosil qiling.";
  }

  return <MarketplaceClient initialListings={listings} loadError={loadError} />;
}
