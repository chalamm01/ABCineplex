import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import type { DashboardStats } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { fmtDT } from './AdminShared';

function StatCard({
  label,
  value,
  sub,
  color = 'text-gray-900',
  bg = 'bg-white',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className={`${bg} rounded-xl border border-gray-200 p-5 flex flex-col gap-1 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export default function DashboardSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getDashboard()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (error || !stats) return <p className="text-red-500 text-sm py-8">{error ?? 'No data.'}</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Today</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Bookings Today"
            value={stats.total_bookings_today}
            color="text-violet-700"
            bg="bg-violet-50"
          />
          <StatCard
            label="Revenue Today"
            value={`฿${fmt(stats.revenue_today)}`}
            color="text-green-700"
            bg="bg-green-50"
          />
          <StatCard
            label="Snack Orders Today"
            value={stats.snack_orders_today}
          />
          <StatCard
            label="Snack Revenue Today"
            value={`฿${fmt(stats.snack_revenue_today)}`}
            color="text-emerald-700"
          />
          <StatCard
            label="Seat Fill"
            value={`${stats.seats_filled_percent}%`}
            sub="Active showtimes today"
            color="text-violet-600"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Time</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Confirmed Bookings"
            value={fmt(stats.total_confirmed_bookings)}
            color="text-violet-700"
          />
          <StatCard
            label="Total Revenue"
            value={`฿${fmt(stats.total_revenue_alltime)}`}
            color="text-green-700"
            bg="bg-green-50"
          />
          <StatCard
            label="Pending Bookings"
            value={stats.pending_bookings}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Movies"
            value={`${stats.movies_now_showing} showing`}
            sub={`${stats.upcoming_movies} upcoming`}
          />
          <StatCard
            label="Total Users"
            value={fmt(stats.total_users)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Movie</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recent_bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                    No confirmed bookings yet.
                  </td>
                </tr>
              ) : (
                stats.recent_bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{b.movie_title ?? '—'}</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">฿{fmt(b.total_amount)}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {b.created_at ? fmtDT(b.created_at) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
