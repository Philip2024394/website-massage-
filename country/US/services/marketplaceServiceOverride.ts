import { marketplaceService } from '../../../lib/marketplaceService';

// US-specific marketplace override enforcing US scope
const usMarketplaceService = {
  ...marketplaceService,
  async listProductsByCountry() {
    return marketplaceService.listProductsByCountry('US');
  }
};

export default usMarketplaceService;
