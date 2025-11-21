// UK-specific marketplace service override example.
// Currently just proxies to base service; customize queries or filtering here.
import { marketplaceService } from '../../../lib/marketplaceService';

const ukMarketplaceService = {
  ...marketplaceService,
  async listProductsByCountry(countryCode?: string) {
    // Force scope to GB regardless of viewer country (example isolation)
    return marketplaceService.listProductsByCountry('GB');
  }
};

export default ukMarketplaceService;
