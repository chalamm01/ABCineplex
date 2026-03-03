import { useState, useEffect } from 'react';
import { adminApi, showtimesApi, type ShowtimeCreate, type Showtime } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead,
  inputCls, btnEdit, btnDanger, fmtDT, useSort, SortableTableHead,
} from './AdminShared';

const emptyShowtime: ShowtimeCreate = { movie_id: 0, theatre_id: 0, start_time: '', base_price: 0 };

type ModalMode = 'add' | 'edit' | null;

export default function ShowtimesSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<ShowtimeCreate>(emptyShowtime);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.listMovies().then(setMovies).catch(() => {});
  }, []);

  async function loadShowtimes(movieId: number) {
    setLoading(true);
    try {
      setShowtimes(await showtimesApi.getShowtimesByMovie(movieId));
    } catch {
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  }

  function onMovieChange(id: number) {
    setSelectedMovieId(id);
    setSearch('');
    loadShowtimes(id);
  }

  function openAdd() {
    setForm({ ...emptyShowtime, movie_id: selectedMovieId ?? 0 });
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(s: Showtime) {
    // DB column is plain TIMESTAMP (no tz) — slice directly to get "YYYY-MM-DDTHH:mm"
    const local = (s.start_time ?? '').replace(' ', 'T').slice(0, 16);
    setForm({ movie_id: s.movie_id, theatre_id: s.theatre_id, start_time: local, base_price: s.base_price });
    setEditId(s.id);
    setModal('edit');
    setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this showtime? This cannot be undone.')) return;
    try {
      await showtimesApi.deleteShowtime(id);
      if (selectedMovieId) loadShowtimes(selectedMovieId);
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    // Send as local cinema time — DB column is plain TIMESTAMP (no tz conversion needed)
    const payload = { ...form, start_time: form.start_time ? `${form.start_time}:00` : form.start_time };
    try {
      if (modal === 'edit' && editId != null) {
        await showtimesApi.updateShowtime(editId, payload);
      } else {
        await showtimesApi.createShowtime(payload);
      }
      setModal(null);
      if (selectedMovieId) loadShowtimes(selectedMovieId);
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof ShowtimeCreate, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const filteredShowtimes = showtimes.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(s.theatre_id).includes(q) ||
      (s.start_time ?? '').includes(q) ||
      String(s.base_price).includes(q)
    );
  });

  const { sorted: sortedShowtimes, sort, toggle } = useSort(filteredShowtimes);

  return (
    <div>
      <SectionHeader title="Showtimes" onAdd={openAdd} addLabel="+ Add Showtime" />

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">
          Filter by Movie
        </label>
        <select
          className={`${inputCls} max-w-xs`}
          value={selectedMovieId ?? ''}
          onChange={e => onMovieChange(+e.target.value)}
        >
          <option value="">Select a movie…</option>
          {movies.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
        {selectedMovieId && (
          <input
            className={`${inputCls} max-w-xs`}
            placeholder="Search theatre, time, price…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        )}
      </div>

      {!selectedMovieId && (
        <p className="text-neutral-400 text-sm py-4">Select a movie above to view and manage its showtimes.</p>
      )}

      {selectedMovieId && (
        loading ? (
          <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm text-left">
              <SortableTableHead
                sort={sort} onSort={toggle}
                cols={[
                  { label: 'ID',            key: 'id' },
                  { label: 'Theatre',       key: 'theatre_id' },
                  { label: 'Start Time',    key: 'start_time' },
                  { label: 'Base Price (฿)', key: 'base_price' },
                  { label: 'Actions',       key: '' },
                ]}
              />
              <tbody>
                {sortedShowtimes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-neutral-400 text-center">
                      No showtimes for this movie.
                    </td>
                  </tr>
                )}
                {sortedShowtimes.map(s => (
                  <tr key={s.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 text-neutral-400">{s.id}</td>
                    <td className="px-3 py-2.5 text-neutral-600">Theatre {s.theatre_id}</td>
                    <td className="px-3 py-2.5 text-neutral-900 font-medium">{fmtDT(s.start_time)}</td>
                    <td className="px-3 py-2.5 text-neutral-600">฿{s.base_price}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button className={btnEdit} onClick={() => openEdit(s)}>Edit</button>
                        <button className={btnDanger} onClick={() => handleDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Showtime' : 'Edit Showtime'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Movie">
              <select className={inputCls} value={form.movie_id} onChange={e => f('movie_id', +e.target.value)}>
                <option value={0}>Select movie…</option>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </Field>
            <Field label="Theatre ID">
              <input className={inputCls} type="number" min="1" value={form.theatre_id} onChange={e => f('theatre_id', +e.target.value)} />
            </Field>
            <Field label="Start Time">
              <input className={inputCls} type="datetime-local" value={form.start_time} onChange={e => f('start_time', e.target.value)} />
            </Field>
            <Field label="Base Price (฿)">
              <input className={inputCls} type="number" step="0.01" min="0" value={form.base_price} onChange={e => f('base_price', +e.target.value)} />
            </Field>
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            onSubmit={handleSubmit}
            submitLabel={modal === 'add' ? 'Create' : 'Save Changes'}
            error={error}
          />
        </Modal>
      )}
    </div>
  );
}
