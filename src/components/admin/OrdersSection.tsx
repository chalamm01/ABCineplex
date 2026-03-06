import { useState, useEffect, useCallback } from 'react';
import { ordersApi, productsApi } from '@/services/api';
import type { OrderResponse, Product } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { SectionHeader, fmtDT, AdminTable } from './AdminShared';

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  preparing: 'bg-blue-100 text-blue-700',
  ready:     'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const NEXT_STATUS: Record<string, string> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'completed',
};

const NEXT_LABEL: Record<string, string> = {
  pending:   'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Complete',
};

function StatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_BADGE[status] ?? 'bg-neutral-100 text-neutral-600'}`}>
      {status}
    </span>
  );
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allOrders, products] = await Promise.all([
        ordersApi.getOrders(),
        productsApi.getAllProducts(200),
      ]);
      const sorted = [...allOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sorted);
      const map: Record<string, Product> = {};
      products.forEach((p) => { map[p.id] = p; });
      setProductMap(map);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status } : o)
      );
    } catch {
      alert('Failed to update order status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error) return <p className="text-red-500 py-8 text-center">{error}</p>;

  return (
    <div>
      <SectionHeader title="Snack Orders" count={orders.length} onAdd={() => {}} addLabel="" />

      {orders.length === 0 ? (
        <p className="text-neutral-400 text-center py-16">No orders yet.</p>
      ) : (
        <AdminTable cols={['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions']}>
          {orders.map((order) => {
            const shortId = order.id.slice(-8).toUpperCase();
            const userId = order.user_id?.slice(-8) ?? '—';
            const itemsSummary = (order.items ?? [])
              .map((item) => {
                const name = productMap[item.product_id]?.name ?? item.product_id.slice(-6);
                return `${name} ×${item.quantity}`;
              })
              .join(', ');
            const nextStatus = NEXT_STATUS[order.status];
            const nextLabel = NEXT_LABEL[order.status];
            const isUpdating = updating === order.id;

            return (
              <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">#{shortId}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">…{userId}</td>
                <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{fmtDT(order.created_at)}</td>
                <td className="px-4 py-3 text-xs text-neutral-700 max-w-xs truncate" title={itemsSummary}>{itemsSummary || '—'}</td>
                <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap">
                  {Number(order.total_amount).toLocaleString()} THB
                </td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus)}
                        disabled={isUpdating}
                        className="text-xs px-2.5 py-1 bg-violet-700 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? '…' : nextLabel}
                      </button>
                    )}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        disabled={isUpdating}
                        className="text-xs px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </div>
  );
}
