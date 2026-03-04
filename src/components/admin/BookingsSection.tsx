import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { SectionHeader, TableHead, inputCls, fmtDT, useSort, SortableTableHead } from './AdminShared';

// Format seats for display - handles both string and object formats
const formatSeats = (seats?: Array<{ seat_id?: number; row_label?: string; seat_number?: number } | string>) => {
  if (!seats || seats.length === 0) return '—';
  return seats
    .map((seat) => {
      if (typeof seat === 'string') return seat;
      if (typeof seat === 'object' && seat && 'row_label' in seat && 'seat_number' in seat) {
        return `${seat.row_label}${seat.seat_number}`;
      }
      return '—';
    })
    .join(', ');
};

// Matches the booking_details view returned by the backend
interface AdminBookingRow {
  booking_id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  showtime_id: number;
  booking_status: string;
  total_amount?: number;
  final_amount_paid?: number;
  points_redeemed?: number;
  ticket_type?: string;
  num_tickets?: number;
  movie_title?: string;
  movie_id?: number;
  showtime_start?: string;
  showtime_end?: string;
  seats?: Array<{ seat_id?: number; row_label?: string; seat_number?: number } | string>;
  screen_name?: string;
  theatre_id?: number;
  created_at?: string;
  updated_at?: string;
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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [movieFilter, setMovieFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    adminApi.listMovies().then(setMovies).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi.listBookings(undefined, undefined, statusFilter || undefined, 200, 0)
      .then(res => setBookings((res.bookings ?? []) as unknown as AdminBookingRow[]))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [refreshKey, statusFilter]);

  const filtered = bookings.filter(b => {
    if (movieFilter !== null && b.movie_id !== movieFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.booking_id ?? '').toLowerCase().includes(q) ||
      (b.movie_title ?? '').toLowerCase().includes(q) ||
      (b.user_id ?? '').toLowerCase().includes(q)
    );
  });
  console.log(filtered)
  const { sorted, sort, toggle } = useSort(filtered);

  return (
    <div>
      <SectionHeader title="Bookings" count={bookings.length} onAdd={() => {}} addLabel="" />

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          className={inputCls}
          style={{ maxWidth: '200px' }}
          value={movieFilter ?? ''}
          onChange={e => setMovieFilter(e.target.value ? +e.target.value : null)}
        >
          <option value="">All Movies</option>
          {movies.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
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
                { label: 'Booking ID', key: 'booking_id' },
                { label: 'Full Name',  key: 'full_name' },
                { label: 'Email',      key: 'email' },
                { label: 'Phone',      key: 'phone' },
                { label: 'Movie',      key: 'movie_title' },
                { label: 'Showtime',   key: 'showtime_start' },
                { label: 'Theatre',    key: 'screen_name' },
                { label: 'Seats',      key: '' },
                { label: 'Points Used',  key: 'points_redeemed' },
                { label: 'Final Amount', key: 'final_amount_paid' },
                { label: 'Status',     key: 'booking_status' },
                { label: 'Method',     key: 'payment_method' },
                { label: 'Paid At',    key: 'paid_at' },
              ]}
            />
            <tbody>
              {sorted.length === 0 && (
                <tr key="empty"><td colSpan={12} className="px-3 py-6 text-neutral-400 text-center">No bookings found.</td></tr>
              )}
              {sorted.map(b => (
                <tr key={b.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2.5 text-neutral-400 font-mono text-xs" title={b.booking_id}>
                    {b.booking_id ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">
                    {b.full_name ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 text-xs">
                    {b.email ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 text-xs">
                    {b.phone ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">
                    {b.movie_title ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 whitespace-nowrap text-xs">
                    {b.showtime_start && b.showtime_end ? `${fmtDT(b.showtime_start)} - ${fmtDT(b.showtime_end)}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 text-xs">
                    {b.screen_name ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">
                    {formatSeats(b.seats)}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">
                    {b.points_redeemed ? `${b.points_redeemed} pts` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">
                    ฿{(b.final_amount_paid ?? b.total_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge status={b.booking_status} /></td>
                  <td className="px-3 py-2.5 text-neutral-500 text-xs capitalize">
                    {b.payment_method?.replace('mock_', '') ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap text-xs">
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
