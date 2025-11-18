import { ADMIN_SHARE_OF_PROMOTER_COMMISSION, PROMOTER_BOOKING_COMMISSION_RATE } from '../constants';

// Minimal shape representing a commission record stored in Appwrite
export interface CommissionRecord {
  $id?: string;
  serviceAmount: number; // Original booking/service amount
  commissionAmount: number; // Promoter gross commission (expected = serviceAmount * 0.20)
  commissionRate?: number; // Percentage (should align with PROMOTER_BOOKING_COMMISSION_RATE * 100)
  status?: string; // pending | verified | rejected | awaiting_verification
  affiliateCode?: string; // Promoter code attribution
  createdAt?: string;
}

export interface AggregatedSettlement {
  totalServiceVolume: number; // Sum of serviceAmount
  totalGrossPromoterCommission: number; // Sum of commissionAmount (or recomputed)
  totalAdminFee: number; // 10% of gross promoter commission
  totalPromoterNet: number; // gross - admin
  effectiveAdminPercent: number; // (totalAdminFee / totalServiceVolume) * 100
  recordCount: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  awaitingVerificationCount: number;
}

/**
 * Aggregate settlement metrics for a set of commission records.
 */
export function aggregateSettlement(records: CommissionRecord[]): AggregatedSettlement {
  const safeRecords = Array.isArray(records) ? records : [];
  let totalServiceVolume = 0;
  let totalGrossPromoterCommission = 0;
  let pendingCount = 0;
  let verifiedCount = 0;
  let rejectedCount = 0;
  let awaitingVerificationCount = 0;

  for (const r of safeRecords) {
    const serviceAmount = Math.max(0, Number(r.serviceAmount) || 0);
    const gross = Math.max(0, Number(r.commissionAmount) || Math.round(serviceAmount * PROMOTER_BOOKING_COMMISSION_RATE));
    totalServiceVolume += serviceAmount;
    totalGrossPromoterCommission += gross;
    switch (r.status) {
      case 'pending':
        pendingCount++; break;
      case 'verified':
        verifiedCount++; break;
      case 'rejected':
        rejectedCount++; break;
      case 'awaiting_verification':
        awaitingVerificationCount++; break;
    }
  }

  const totalAdminFee = Math.round(totalGrossPromoterCommission * ADMIN_SHARE_OF_PROMOTER_COMMISSION);
  const totalPromoterNet = totalGrossPromoterCommission - totalAdminFee;
  const effectiveAdminPercent = totalServiceVolume > 0 ? (totalAdminFee / totalServiceVolume) * 100 : 0;

  return {
    totalServiceVolume,
    totalGrossPromoterCommission,
    totalAdminFee,
    totalPromoterNet,
    effectiveAdminPercent: Math.round(effectiveAdminPercent * 100) / 100,
    recordCount: safeRecords.length,
    pendingCount,
    verifiedCount,
    rejectedCount,
    awaitingVerificationCount,
  };
}

/**
 * Utility to derive per-record breakdown including admin fee & promoter net.
 */
export function mapRecordBreakdown(record: CommissionRecord) {
  const gross = Math.max(0, Number(record.commissionAmount) || 0);
  const adminFee = Math.round(gross * ADMIN_SHARE_OF_PROMOTER_COMMISSION);
  const promoterNet = gross - adminFee;
  return {
    ...record,
    grossPromoterCommission: gross,
    adminFee,
    promoterNet,
  };
}

/**
 * Filter records by promoter affiliate code attribution.
 */
export function filterByAffiliateCode(records: CommissionRecord[], affiliateCode: string | undefined) {
  if (!affiliateCode) return records;
  return records.filter(r => r.affiliateCode === affiliateCode);
}
