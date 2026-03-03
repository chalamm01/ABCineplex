import { useState, useEffect } from 'react';
import { adminApi, showtimesApi, type ShowtimeCreate, type Showtime, type Theatre, type Seat } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { SeatMapModal } from './SeatMapModal';
import {
  Modal, Field, ModalActions, SectionHeader,
  inputCls, btnEdit, btnDanger, fmtDT, useSort, SortableTableHead,
  EditButton, DeleteButton,
} from './AdminShared';

const emptyShowtime: ShowtimeCreate = {
  movie_id: 0, theatre_id: 0, start_time: '', end_time: undefined, base_price: 0,
  audio_language: '', subtitle_language: '',
  student_discount_baht: 20, member_discount_baht: 30,
};

type ModalMode = 'add' | 'edit' | null;

function fmtTime(dt?: string) {
  if (!dt) return '—';
  try {
    const d = new Date(dt);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  } catch { return dt; }
}

export default function ShowtimesSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]);
  const [movieFilter, setMovieFilter] = useState<number | null>(null);
  const [theatreFilter, setTheatreFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<ShowtimeCreate>(emptyShowtime);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    adminApi.listMovies().then(setMovies).catch(() => {});
    adminApi.listTheatres().then(setTheatres).catch(() => {});
    loadAllShowtimes();
  }, [refreshKey]);

  async function loadAllShowtimes() {
    setLoading(true);
    try {
      // Fetch all showtimes directly from DB (includes active + inactive)
      const allShowtimesData = await adminApi.listAllShowtimes();
      setAllShowtimes(allShowtimesData);
    } catch (error) {
      console.error('Failed to load showtimes:', error);
      setAllShowtimes([]);
    } finally {
      setLoading(false);
    }
  }

  // When movie changes inside the form, auto-update language defaults
  function onFormMovieChange(movieId: number) {
    const movie = movies.find(m => m.id === movieId);
    setForm(prev => ({
      ...prev,
      movie_id: movieId,
      audio_language: movie?.audio_languages?.[0] ?? '',
      subtitle_language: movie?.subtitle_languages?.[0] ?? '',
    }));
  }

  function openAdd() {
    setForm(emptyShowtime);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(s: Showtime) {
    const local = (s.start_time ?? '').replace(' ', 'T').slice(0, 16);
    const endLocal = s.end_time ? (s.end_time ?? '').replace(' ', 'T').slice(0, 16) : '';
    setForm({
      movie_id: s.movie_id,
      theatre_id: s.theatre_id,
      start_time: local,
      end_time: endLocal || undefined,
      base_price: s.base_price,
      audio_language: s.audio_language ?? '',
      subtitle_language: s.subtitle_language ?? '',
      student_discount_baht: s.student_discount_baht ?? 20,
      member_discount_baht: s.member_discount_baht ?? 30,
    });
    setEditId(s.id);
    setModal('edit');
    setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this showtime? This cannot be undone.')) return;
    try {
      await showtimesApi.deleteShowtime(id);
      setRefreshKey(k => k + 1);
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function openSeatMap(showtime: Showtime) {
    setSelectedShowtime(showtime);
    try {
      // Load showtime-specific seat configurations
      const showtimeSeats = await adminApi.listShowtimeSeats(showtime.id);
      // Convert to Seat format for display
      const theatreSeats = await adminApi.listSeats(showtime.theatre_id);
      setSeats(theatreSeats);
      // Store showtime seats for reference during save
      (showtime as any)._showtimeSeats = showtimeSeats;
    } catch (e) {
      console.error('Failed to load seats:', e);
    }
    setSeatMapOpen(true);
  }

  async function handleSubmit() {
    setError('');

    // Validate that start_time is not in the past
    const startDateTime = new Date(form.start_time);
    const now = new Date();
    if (startDateTime < now) {
      setError('Showtime cannot be in the past. Please select a future date and time.');
      return;
    }

    const payload = {
      ...form,
      start_time: form.start_time ? `${form.start_time}:00` : form.start_time,
      audio_language: form.audio_language || undefined,
      subtitle_language: form.subtitle_language || undefined,

    };
    try {
      if (modal === 'edit' && editId != null) {
        await showtimesApi.updateShowtime(editId, payload);
      } else {
        await showtimesApi.createShowtime(payload);
      }
      setModal(null);
      setRefreshKey(k => k + 1);
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof ShowtimeCreate, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const filteredShowtimes = allShowtimes.filter(s => {
    if (movieFilter !== null && s.movie_id !== movieFilter) return false;
    if (theatreFilter !== null && s.theatre_id !== theatreFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (movies.find(m => m.id === s.movie_id)?.title ?? '').toLowerCase().includes(q) ||
      (theatres.find(t => t.id === s.theatre_id)?.name ?? '').toLowerCase().includes(q) ||
      (s.start_time ?? '').includes(q) ||
      (s.audio_language ?? '').toLowerCase().includes(q) ||
      (s.subtitle_language ?? '').toLowerCase().includes(q) ||
      String(s.base_price).includes(q)
    );
  });

  const { sorted: sortedShowtimes, sort, toggle } = useSort(filteredShowtimes);

  // Language options for the current form movie
  const formMovie = movies.find(m => m.id === form.movie_id);
  const formAudioOptions = formMovie?.audio_languages ?? [];
  const formSubtitleOptions = formMovie?.subtitle_languages ?? [];

  return (
    <div>
      <SectionHeader title="Showtimes" count={allShowtimes.length} onAdd={openAdd} addLabel="+ Add Showtime" />

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
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
        <select
          className={inputCls}
          style={{ maxWidth: '200px' }}
          value={theatreFilter ?? ''}
          onChange={e => setTheatreFilter(e.target.value ? +e.target.value : null)}
        >
          <option value="">All Theatres</option>
          {theatres.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          className={inputCls}
          style={{ maxWidth: '280px' }}
          placeholder="Search by movie, theatre, time, language…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
              <SortableTableHead
                sort={sort} onSort={toggle}
                cols={[
                  { label: 'ID',          key: 'id' },
                  { label: 'Movie',       key: 'movie_id' },
                  { label: 'Theatre',     key: 'theatre_id' },
                  { label: 'Start',       key: 'start_time' },
                  { label: 'End',         key: 'end_time' },
                  { label: 'Audio',       key: 'audio_language' },
                  { label: 'Subtitles',   key: 'subtitle_language' },
                  { label: 'Base (฿)',    key: 'base_price' },
                  { label: 'Student -฿', key: 'student_discount_baht' },
                  { label: 'Member -฿',  key: 'member_discount_baht' },
                  { label: 'Actions',    key: '' },
                ]}
              />
              <tbody>
                {sortedShowtimes.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-3 py-6 text-neutral-400 text-center">
                      No showtimes found.
                    </td>
                  </tr>
                )}
                {sortedShowtimes.map(s => (
                  <tr key={s.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 text-neutral-400">{s.id}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{movies.find(m => m.id === s.movie_id)?.title ?? `Movie ${s.movie_id}`}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{theatres.find(t => t.id === s.theatre_id)?.name ?? `Theatre ${s.theatre_id}`}</td>
                    <td className="px-3 py-2.5 text-neutral-900 font-medium">{fmtDT(s.start_time)}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{fmtTime(s.end_time)}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.audio_language ?? '—'}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.subtitle_language ?? '—'}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.base_price}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.student_discount_baht == null ? '—' : `-฿${s.student_discount_baht}`}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.member_discount_baht == null ? '—' : `-฿${s.member_discount_baht}`}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <EditButton onClick={() => openEdit(s)} />
                        <button type="button" className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors" onClick={() => openSeatMap(s)}>Seats</button>
                        <DeleteButton onClick={() => handleDelete(s.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Showtime' : 'Edit Showtime'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Movie">
              <select
                className={inputCls}
                value={form.movie_id}
                onChange={e => onFormMovieChange(+e.target.value)}
              >
                <option value={0}>Select movie…</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </Field>
            <Field label="Theatre">
              <select
                className={inputCls}
                value={form.theatre_id}
                onChange={e => f('theatre_id', +e.target.value)}
              >
                <option value={0}>Select theatre…</option>
                {theatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Start Time">
              <input className={inputCls} type="datetime-local" value={form.start_time} onChange={e => f('start_time', e.target.value)} />
            </Field>
            <Field label="End Time (Optional)">
              <input className={inputCls} type="datetime-local" value={form.end_time ?? ''} onChange={e => f('end_time', e.target.value || undefined)} />
            </Field>

            {/* Audio Language */}
            <Field label="Audio Language">
              {formAudioOptions.length > 0 ? (
                <select
                  className={inputCls}
                  value={form.audio_language ?? ''}
                  onChange={e => f('audio_language', e.target.value)}
                >
                  <option value="">— auto from movie —</option>
                  {formAudioOptions.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={inputCls}
                  placeholder="e.g. EN, TH…"
                  value={form.audio_language ?? ''}
                  onChange={e => f('audio_language', e.target.value)}
                />
              )}
            </Field>

            {/* Subtitle Language */}
            <Field label="Subtitle Language">
              {formSubtitleOptions.length > 0 ? (
                <select
                  className={inputCls}
                  value={form.subtitle_language ?? ''}
                  onChange={e => f('subtitle_language', e.target.value)}
                >
                  <option value="">— none —</option>
                  {formSubtitleOptions.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={inputCls}
                  placeholder="e.g. EN, TH…"
                  value={form.subtitle_language ?? ''}
                  onChange={e => f('subtitle_language', e.target.value)}
                />
              )}
            </Field>

            <Field label="Base Price (฿)">
              <input className={inputCls} type="number" step="0.01" min="0" value={form.base_price} onChange={e => f('base_price', +e.target.value)} />
            </Field>
            <Field label="Student Discount (฿)">
              <input className={inputCls} type="number" step="0.01" min="0"
                value={form.student_discount_baht ?? 20}
                onChange={e => f('student_discount_baht', +e.target.value)} />
            </Field>
            <Field label="Member Discount (฿)">
              <input className={inputCls} type="number" step="0.01" min="0"
                value={form.member_discount_baht ?? 30}
                onChange={e => f('member_discount_baht', +e.target.value)} />
            </Field>
          </div>
          {form.movie_id > 0 && (
            <p className="text-xs text-neutral-400 mt-2">
              If no end time is provided, it will be calculated automatically from movie runtime + credits.
              Minimum 30-minute gap between showtimes in the same theatre.
            </p>
          )}
          <ModalActions
            onCancel={() => setModal(null)}
            onSubmit={handleSubmit}
            submitLabel={modal === 'add' ? 'Create' : 'Save Changes'}
            error={error}
          />
        </Modal>
      )}

      {seatMapOpen && (
        <SeatMapModal
          isOpen={seatMapOpen}
          title={selectedShowtime ? `Manage Seats - ${selectedShowtime.id} (${theatres.find(t => t.id === selectedShowtime.theatre_id)?.name})` : 'Manage Seats'}
          theatreId={selectedShowtime?.theatre_id ?? 0}
          showtimeId={selectedShowtime?.id}
          rows={selectedShowtime ? (theatres.find(t => t.id === selectedShowtime.theatre_id)?.total_seats ?? 120) / 15 : 8}
          columns={15}
          onClose={() => {
            setSeatMapOpen(false);
            setSelectedShowtime(null);
          }}
          onSave={async (seatGrid: Map<string, boolean>) => {
            if (!selectedShowtime) return;

            // Build seat configs for this specific showtime
            const seatConfigs: Record<number, boolean> = {};

            for (const [key, isActive] of seatGrid.entries()) {
              const [row, colStr] = key.split('-');
              const col = parseInt(colStr, 10);
              const seat = seats.find(s => s.row_label === row && s.seat_number === col);
              if (seat) {
                seatConfigs[seat.id] = isActive;
              }
            }

            // Update showtime-specific seat configurations (not theatre seats)
            await adminApi.updateShowtimeSeats(selectedShowtime.id, seatConfigs);
            setRefreshKey(k => k + 1);
            setSeatMapOpen(false);
            setSelectedShowtime(null);
          }}
        />
      )}
    </div>
  );
}
