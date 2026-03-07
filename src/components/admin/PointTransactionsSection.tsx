import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import type { AdminPointTransaction } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { fmtDT } from './AdminShared';

const PAGE_SIZE = 50;

export function PointTransactionsSection() {
  const [transactions, setTransactions] = useState<AdminPointTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUserId, setFilterUserId] = useState('');
  const [filterReason, setFilterReason] = useState('');

  const fetchTransactions = useCallback(async (offset: number, userId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.listPointTransactions({
        limit: PAGE_SIZE,
        offset,
        user_id: userId || undefined,
        reason: reason || undefined,
      });
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch {
      setError('Failed to load point transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(page * PAGE_SIZE, filterUserId, filterReason);
  }, [page, fetchTransactions, filterUserId, filterReason]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions(0, filterUserId, filterReason);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Point Transactions</h2>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Filter by user ID…"
          value={filterUserId}
          onChange={e => setFilterUserId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64"
        />
        <input
          type="text"
          placeholder="Filter by reason…"
          value={filterReason}
          onChange={e => setFilterReason(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48"
        />
        <Button type="submit" size="sm" variant="outline">Apply</Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => { setFilterUserId(''); setFilterReason(''); setPage(0); }}
        >
          Clear
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Points</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.user_email}</p>
                    {t.user_full_name && (
                      <p className="text-xs text-gray-400">{t.user_full_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${t.points_delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {t.points_delta >= 0 ? '+' : ''}{t.points_delta}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{t.reason}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {t.reference_id ? t.reference_id.slice(-8) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {t.created_at ? fmtDT(t.created_at) : '—'}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
