import { marketplaceService } from '../../../lib/marketplaceService';

// Thailand-specific marketplace override enforcing TH scope
const thMarketplaceService = {
  ...marketplaceService,
  async listProductsByCountry() {
    return marketplaceService.listProductsByCountry('TH');
  }
};

export default thMarketplaceService;
