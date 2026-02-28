import { useState, useEffect } from 'react';
import { moviesApi, showtimesApi, type ShowtimeCreate, type Showtime } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead,
  inputCls, btnEdit, btnDanger,
} from './AdminShared';

const emptyShowtime: ShowtimeCreate = { movie_id: 0, screen_id: 0, start_time: '', base_price: 0 };

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

  useEffect(() => {
    moviesApi.getMovies(1, 100).then(setMovies).catch(() => {});
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
    loadShowtimes(id);
  }

  function openAdd() {
    setForm({ ...emptyShowtime, movie_id: selectedMovieId ?? 0 });
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(s: Showtime) {
    const dt = new Date(s.start_time);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({ movie_id: s.movie_id, screen_id: s.screen_id, start_time: local, base_price: s.base_price });
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
    const payload = { ...form, start_time: new Date(form.start_time).toISOString() };
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

  return (
    <div>
      <SectionHeader title="Showtimes" onAdd={openAdd} addLabel="+ Add Showtime" />

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap">
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
      </div>

      {!selectedMovieId && (
        <p className="text-zinc-500 text-sm py-4">Select a movie above to view and manage its showtimes.</p>
      )}

      {selectedMovieId && (
        loading ? (
          <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <TableHead cols={['ID', 'Screen', 'Start Time', 'Base Price (฿)', 'Actions']} />
              <tbody>
                {showtimes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-zinc-500 text-center">
                      No showtimes for this movie.
                    </td>
                  </tr>
                )}
                {showtimes.map(s => (
                  <tr key={s.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                    <td className="px-3 py-2 text-zinc-400">{s.id}</td>
                    <td className="px-3 py-2 text-zinc-300">Screen {s.screen_id}</td>
                    <td className="px-3 py-2 text-white">{new Date(s.start_time).toLocaleString()}</td>
                    <td className="px-3 py-2 text-zinc-300">฿{s.base_price}</td>
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
            <Field label="Screen ID">
              <input className={inputCls} type="number" min="1" value={form.screen_id} onChange={e => f('screen_id', +e.target.value)} />
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
