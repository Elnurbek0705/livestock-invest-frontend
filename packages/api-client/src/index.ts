import type { LivestockInvestApi } from "./types";
import { httpApi } from "./http/httpApi";

export * from "./types";
export { tokenStore } from "./http/tokenStore";

export function getApiClient(): LivestockInvestApi {
  return httpApi;
}
