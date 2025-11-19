import { useEffect, useState } from 'react';
import { coinService, CoinBalance, CoinTransaction } from '../../lib/coinService';

export function useCoinBalance(userId?: string) {
  const [balance, setBalance] = useState<CoinBalance | null>(null);
  useEffect(() => {
    if (!userId) return;
    coinService.getCoinBalance(userId).then(setBalance);
  }, [userId]);
  return balance;
}

export function useCoinHistory(userId?: string, limit = 50) {
  const [history, setHistory] = useState<CoinTransaction[]>([]);
  useEffect(() => {
    if (!userId) return;
    coinService.getTransactionHistory(userId, limit).then(setHistory);
  }, [userId, limit]);
  return history;
}
