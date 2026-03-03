import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { SectionHeader, TableHead, inputCls, fmtDT, useSort, SortableTableHead } from './AdminShared';

// Matches the booking_details view + payments merge returned by the backend
interface AdminBookingRow {
  booking_id: string;
  user_id: string;
  showtime_id: number;
  booking_status: string;
  total_amount?: number;
  ticket_type?: string;
  num_tickets?: number;
  movie_title?: string;
  showtime_start?: string;
  seats?: string[];
  created_at?: string;
  updated_at?: string;
  // from payments table (merged by backend)
  paid_at?: string;
  payment_method?: string;
  payment_status?: string;
}

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
  changed: 'bg-blue-100 text-blue-700',
};

function StatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_BADGE[status] ?? 'bg-neutral-100 text-neutral-600'}`}>
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
      (b.booking_id ?? '').toLowerCase().includes(q) ||
      (b.movie_title ?? '').toLowerCase().includes(q) ||
      (b.user_id ?? '').toLowerCase().includes(q)
    );
  });

  const { sorted, sort, toggle } = useSort(filtered);

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
          className="text-xs px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 rounded-lg transition-colors border border-neutral-200"
          onClick={refresh}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
            <SortableTableHead
              sort={sort} onSort={toggle}
              cols={[
                { label: 'Booking ID', key: '' },
                { label: 'Movie',      key: 'movie_title' },
                { label: 'Showtime',   key: 'showtime_start' },
                { label: 'Seats',      key: '' },
                { label: 'Amount',     key: 'total_amount' },
                { label: 'Status',     key: 'booking_status' },
                { label: 'Method',     key: 'payment_method' },
                { label: 'Paid At',    key: 'paid_at' },
              ]}
            />
            <tbody>
              {sorted.length === 0 && (
                <tr key="empty"><td colSpan={8} className="px-3 py-6 text-neutral-400 text-center">No bookings found.</td></tr>
              )}
              {sorted.map(b => (
                <tr key={b.booking_id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2.5 text-neutral-400 font-mono text-xs max-w-35 truncate" title={b.booking_id}>
                    {(b.booking_id ?? '').slice(0, 8)}…
                  </td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">
                    {b.movie_title ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 whitespace-nowrap">
                    {fmtDT(b.showtime_start)}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">
                    {b.seats && b.seats.length > 0 ? b.seats.join(', ') : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">฿{b.total_amount?.toLocaleString() ?? '—'}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={b.booking_status} /></td>
                  <td className="px-3 py-2.5 text-neutral-500 text-xs capitalize">
                    {b.payment_method?.replace('mock_', '') ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap">
                    {fmtDT(b.paid_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
