import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { SectionHeader, TableHead, inputCls } from './AdminShared';

// Raw DB shape returned by GET /admin/bookings (select("*"))
interface AdminBookingRow {
  id: string;
  user_id: string;
  showtime_id: number;
  booking_status: string;
  total_price?: number;
  ticket_type?: string;
  num_tickets?: number;
  created_at?: string;
  updated_at?: string;
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-green-900 text-green-300',
  pending: 'bg-yellow-900 text-yellow-300',
  cancelled: 'bg-red-900 text-red-300',
  changed: 'bg-blue-900 text-blue-300',
};

function StatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[status] ?? 'bg-zinc-700 text-zinc-300'}`}>
      {status}
    </span>
  );
}

const STATUS_OPTIONS = ['', 'confirmed', 'pending', 'cancelled', 'changed'];

export default function BookingsSection() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    adminApi.listBookings(undefined, undefined, statusFilter || undefined, 200, 0)
      .then(res => setBookings((res.bookings ?? []) as unknown as AdminBookingRow[]))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [refreshKey, statusFilter]);

  const filtered = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.user_id.toLowerCase().includes(q) ||
      String(b.showtime_id).includes(q)
    );
  });

  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <SectionHeader title="Bookings" count={bookings.length} onAdd={() => {}} addLabel="" />

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className={inputCls}
          style={{ maxWidth: '260px' }}
          placeholder="Search by booking ID, movie, user…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={inputCls}
          style={{ maxWidth: '180px' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
        <button
          className="text-xs px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors"
          onClick={refresh}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <TableHead cols={['Booking ID', 'User ID', 'Showtime ID', 'Type', 'Tickets', 'Amount', 'Status', 'Created']} />
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-zinc-500 text-center">No bookings found.</td></tr>
              )}
              {filtered.map(b => (
                <tr key={b.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-3 py-2 text-zinc-400 font-mono text-xs max-w-[140px] truncate" title={b.id}>
                    {b.id.slice(0, 8)}…
                  </td>
                  <td className="px-3 py-2 text-zinc-400 font-mono text-xs max-w-[160px] truncate" title={b.user_id}>
                    {b.user_id.slice(0, 8)}…
                  </td>
                  <td className="px-3 py-2 text-zinc-300">{b.showtime_id}</td>
                  <td className="px-3 py-2 text-zinc-300">{b.ticket_type ?? '—'}</td>
                  <td className="px-3 py-2 text-zinc-300">{b.num_tickets ?? '—'}</td>
                  <td className="px-3 py-2 text-zinc-300">฿{b.total_price?.toLocaleString() ?? '—'}</td>
                  <td className="px-3 py-2"><StatusBadge status={b.booking_status} /></td>
                  <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{formatDateTime(b.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
