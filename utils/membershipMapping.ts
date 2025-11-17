export type PublicPlanId = 'monthly' | '3months' | '6months' | '12months';
export type PaymentPackageId = '1m' | '3m' | '6m' | '1y';

// Translation-safe mapping by stable plan keys (not labels)
export function mapPublicPlanIdToPaymentPkg(id: string): PaymentPackageId {
  switch (id) {
    case 'monthly': return '1m';
    case '3months': return '3m';
    case '6months': return '6m';
    case '12months': return '1y';
    default:
      // Fallback: try to coerce common ids
      if (/^1m(onth)?$/i.test(id)) return '1m';
      if (/^3m(onths)?$/i.test(id)) return '3m';
      if (/^6m(onths)?$/i.test(id)) return '6m';
      if (/^(12|1y)/i.test(id)) return '1y';
      return '1m';
  }
}
