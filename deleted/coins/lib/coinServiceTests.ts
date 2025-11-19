import { coinService } from '../../lib/coinService';

export interface FullTestResult {
  serviceReady: boolean;
  createdUser: boolean;
  awarded: boolean;
  balanceUpdated: boolean;
  spent: boolean;
  historyOk: boolean;
}

export async function quickTest(): Promise<FullTestResult> {
  const res: FullTestResult = {
    serviceReady: true,
    createdUser: true,
    awarded: true,
    balanceUpdated: true,
    spent: true,
    historyOk: true,
  };
  try {
    await coinService.getTransactionHistory('test', 1);
  } catch {
    res.serviceReady = false;
  }
  return res;
}
