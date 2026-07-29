import type { LivestockInvestApi } from "./types";
import { httpApi } from "./http/httpApi";

export * from "./types";
export { tokenStore } from "./http/tokenStore";
export {
  getPendingRequestCount,
  onPendingRequestsChange,
} from "./http/httpClient";

export function getApiClient(): LivestockInvestApi {
  return httpApi;
}
