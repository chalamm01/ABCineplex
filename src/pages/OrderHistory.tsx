import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi, productsApi } from '@/services/api';
import type { OrderResponse, Product } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { ShoppingBag, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';
import { ImageWithLoader } from '@/components/ui/image-with-loader';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   className: 'bg-amber-100 text-amber-700',   icon: <Clock className="w-3.5 h-3.5" /> },
  preparing: { label: 'Preparing', className: 'bg-blue-100 text-blue-700',     icon: <ChefHat className="w-3.5 h-3.5" /> },
  ready:     { label: 'Ready',     className: 'bg-green-100 text-green-700',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-600',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-600',       icon: <XCircle className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    Promise.all([
      ordersApi.getOrders(),
      productsApi.getAllProducts(200),
    ])
      .then(([orderList, products]) => {
        const sorted = [...orderList].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sorted);
        const map: Record<string, Product> = {};
        products.forEach((p) => { map[p.id] = p; });
        setProductMap(map);
      })
      .catch(() => setError('Failed to load your order history.'))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center bg-white/70 backdrop-blur-md">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex flex-col items-center justify-center bg-white/70 backdrop-blur-md p-6 text-center">
          <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Sign in to view your orders</h2>
          <p className="text-slate-500 mb-6">Your snack order history is only available when you're logged in.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-violet-900 text-white font-bold rounded-xl hover:bg-violet-800 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen bg-white/75 backdrop-blur-md">

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <p className="text-violet-300 text-sm font-semibold uppercase tracking-widest mb-2">ABCineplex</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Snack Orders</h1>
            <p className="text-violet-200 text-sm">Your pickup order history</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">

          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-violet-900 text-white rounded-xl font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {!error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">No orders yet</h3>
              <p className="text-slate-400 mb-6">When you order snacks, they'll appear here.</p>
              <button
                onClick={() => navigate('/snacks')}
                className="px-8 py-3 bg-violet-900 text-white font-bold rounded-xl hover:bg-violet-800 transition-colors"
              >
                Order Snacks
              </button>
            </div>
          )}

          {!error && orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => {
                const date = new Date(order.created_at);
                const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const shortId = order.id.slice(-8).toUpperCase();

                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Order header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Order #{shortId}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{dateStr} at {timeStr}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Items */}
                    <div className="px-5 py-4 space-y-2.5">
                      {(order.items ?? []).map((item) => {
                        const product = productMap[item.product_id];
                        const name = product?.name ?? `Item ${item.product_id.slice(-6)}`;
                        const image = product?.image_url ?? '/assets/images/placeholder.png';
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <ImageWithLoader
                              src={image}
                              alt={name}
                              width={40}
                              height={40}
                              objectFit="contain"
                              containerClassName="shrink-0"
                              className="rounded-xl bg-violet-50 p-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                              <p className="text-xs text-slate-400">×{item.quantity} × {Number(item.unit_price).toLocaleString()} THB</p>
                            </div>
                            <p className="text-sm font-bold text-violet-700 shrink-0">
                              {Number(item.subtotal).toLocaleString()} THB
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-100">
                      <p className="text-sm text-slate-500">{(order.items ?? []).length} item{(order.items ?? []).length !== 1 ? 's' : ''}</p>
                      <p className="text-base font-extrabold text-gray-900">
                        {Number(order.total_amount).toLocaleString()} <span className="text-sm font-semibold text-slate-400">THB</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
