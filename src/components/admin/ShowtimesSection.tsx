import { useState, useEffect } from 'react';
import { adminApi, showtimesApi, type ShowtimeCreate, type Showtime } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader,
  inputCls, btnEdit, btnDanger, fmtDT, useSort, SortableTableHead,
} from './AdminShared';

const emptyShowtime: ShowtimeCreate = {
  movie_id: 0, theatre_id: 0, start_time: '', base_price: 0,
  audio_language: '', subtitle_language: '', format: '',
  ticket_price_normal: undefined, ticket_price_student: undefined,
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
    const movie = movies.find(m => m.id === selectedMovieId);
    setForm({
      ...emptyShowtime,
      movie_id: selectedMovieId ?? 0,
      audio_language: movie?.audio_languages?.[0] ?? '',
      subtitle_language: movie?.subtitle_languages?.[0] ?? '',
    });
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(s: Showtime) {
    const local = (s.start_time ?? '').replace(' ', 'T').slice(0, 16);
    setForm({
      movie_id: s.movie_id,
      theatre_id: s.theatre_id,
      start_time: local,
      base_price: s.base_price,
      audio_language: s.audio_language ?? '',
      subtitle_language: s.subtitle_language ?? '',
      format: s.format ?? '',
      ticket_price_normal: s.ticket_price_normal ?? undefined,
      ticket_price_student: s.ticket_price_student ?? undefined,
    });
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
    const payload = {
      ...form,
      start_time: form.start_time ? `${form.start_time}:00` : form.start_time,
      audio_language: form.audio_language || undefined,
      subtitle_language: form.subtitle_language || undefined,
      format: form.format || undefined,
    };
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
      <SectionHeader title="Showtimes" onAdd={openAdd} addLabel="+ Add Showtime" />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">
          Filter by Movie
        </span>
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
            placeholder="Search theatre, time, language…"
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
                  { label: 'ID',          key: 'id' },
                  { label: 'Theatre',     key: 'theatre_id' },
                  { label: 'Start',       key: 'start_time' },
                  { label: 'End',         key: 'end_time' },
                  { label: 'Audio',       key: 'audio_language' },
                  { label: 'Subtitles',   key: 'subtitle_language' },
                  { label: 'Base (฿)',    key: 'base_price' },
                  { label: 'Normal (฿)', key: 'ticket_price_normal' },
                  { label: 'Student (฿)',key: 'ticket_price_student' },
                  { label: 'Actions',    key: '' },
                ]}
              />
              <tbody>
                {sortedShowtimes.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-neutral-400 text-center">
                      No showtimes for this movie.
                    </td>
                  </tr>
                )}
                {sortedShowtimes.map(s => (
                  <tr key={s.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-3 py-2.5 text-neutral-400">{s.id}</td>
                    <td className="px-3 py-2.5 text-neutral-600">Theatre {s.theatre_id}</td>
                    <td className="px-3 py-2.5 text-neutral-900 font-medium">{fmtDT(s.start_time)}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{fmtTime(s.end_time)}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.audio_language ?? '—'}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.subtitle_language ?? '—'}</td>
                    <td className="px-3 py-2.5 text-neutral-600">฿{s.base_price}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.ticket_price_normal == null ? '—' : `฿${s.ticket_price_normal}`}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{s.ticket_price_student == null ? '—' : `฿${s.ticket_price_student}`}</td>
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
              <select
                className={inputCls}
                value={form.movie_id}
                onChange={e => onFormMovieChange(+e.target.value)}
              >
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
            <Field label="Format">
              <input className={inputCls} placeholder="2D / 3D / IMAX…" value={form.format ?? ''} onChange={e => f('format', e.target.value)} />
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
            <Field label="Normal Ticket (฿)">
              <input className={inputCls} type="number" step="0.01" min="0"
                value={form.ticket_price_normal ?? ''}
                placeholder="Leave blank to use base price"
                onChange={e => f('ticket_price_normal', e.target.value ? +e.target.value : undefined)} />
            </Field>
            <Field label="Student Ticket (฿)">
              <input className={inputCls} type="number" step="0.01" min="0"
                value={form.ticket_price_student ?? ''}
                placeholder="Leave blank to use base price"
                onChange={e => f('ticket_price_student', e.target.value ? +e.target.value : undefined)} />
            </Field>
          </div>
          {form.movie_id > 0 && (
            <p className="text-xs text-neutral-400 mt-2">
              End time is calculated automatically from movie runtime + credits.
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
    </div>
  );
}
