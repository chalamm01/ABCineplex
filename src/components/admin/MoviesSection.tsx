import { useState, useEffect, useCallback } from 'react';
import { moviesApi, type MovieCreate } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, StatusBadge, TableHead,
  inputCls, btnEdit, btnDanger, joinLines, splitLines,
} from './AdminShared';

const emptyMovie: MovieCreate = {
  title: '', release_date: '', duration_minutes: 0, content_rating: '',
  release_status: 'coming_soon', poster_url: '', banner_url: '',
  synopsis: '', director: '', starring: [], genres: [],
  audio_languages: [], subtitle_languages: [], imdb_score: undefined,
  trailer_url: '', tag_event: '',
};

type ModalMode = 'add' | 'edit' | null;

export default function MoviesSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<MovieCreate>(emptyMovie);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    moviesApi.getMovies(1, 100)
      .then(setMovies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm(emptyMovie);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(m: Movie) {
    setForm({
      title: m.title,
      release_date: m.release_date,
      duration_minutes: m.duration_minutes,
      content_rating: m.content_rating,
      release_status: m.release_status,
      poster_url: m.poster_url,
      banner_url: m.banner_url,
      synopsis: m.synopsis ?? '',
      director: m.director ?? '',
      starring: m.starring ?? [],
      genres: m.genres ?? [],
      audio_languages: m.audio_languages ?? [],
      subtitle_languages: m.subtitle_languages ?? [],
      imdb_score: m.imdb_score,
      trailer_url: m.trailer_url ?? '',
      tag_event: m.tag_event ?? '',
    });
    setEditId(m.id);
    setModal('edit');
    setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this movie? This cannot be undone.')) return;
    try {
      await moviesApi.deleteMovie(id);
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId != null) {
        await moviesApi.updateMovie(editId, form);
      } else {
        await moviesApi.createMovie(form);
      }
      setModal(null);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof MovieCreate, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <SectionHeader title="Movies" count={movies.length} onAdd={openAdd} addLabel="+ Add Movie" />

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <TableHead cols={['ID', 'Title', 'Status', 'Duration', 'Rating', 'Release Date', 'Actions']} />
            <tbody>
              {movies.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-zinc-500 text-center">No movies found.</td></tr>
              )}
              {movies.map(m => (
                <tr key={m.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-3 py-2 text-zinc-400">{m.id}</td>
                  <td className="px-3 py-2 text-white font-medium">{m.title}</td>
                  <td className="px-3 py-2"><StatusBadge value={m.release_status} /></td>
                  <td className="px-3 py-2 text-zinc-300">{m.duration_minutes}m</td>
                  <td className="px-3 py-2 text-zinc-300">{m.content_rating}</td>
                  <td className="px-3 py-2 text-zinc-300">{m.release_date}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button className={btnEdit} onClick={() => openEdit(m)}>Edit</button>
                      <button className={btnDanger} onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Movie' : 'Edit Movie'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={e => f('title', e.target.value)} />
            </Field>
            <Field label="Release Date (YYYY-MM-DD)">
              <input className={inputCls} type="date" value={form.release_date} onChange={e => f('release_date', e.target.value)} />
            </Field>
            <Field label="Duration (minutes)">
              <input className={inputCls} type="number" min="1" value={form.duration_minutes} onChange={e => f('duration_minutes', +e.target.value)} />
            </Field>
            <Field label="Content Rating">
              <input className={inputCls} value={form.content_rating} placeholder="e.g. PG-13" onChange={e => f('content_rating', e.target.value)} />
            </Field>
            <Field label="Release Status">
              <select className={inputCls} value={form.release_status} onChange={e => f('release_status', e.target.value)}>
                <option value="coming_soon">Coming Soon</option>
                <option value="now_showing">Now Showing</option>
                <option value="ended">Ended</option>
              </select>
            </Field>
            <Field label="IMDB Score">
              <input
                className={inputCls} type="number" step="0.1" min="0" max="10"
                value={form.imdb_score ?? ''}
                onChange={e => f('imdb_score', e.target.value ? +e.target.value : undefined)}
              />
            </Field>
            <Field label="Director">
              <input className={inputCls} value={form.director ?? ''} onChange={e => f('director', e.target.value)} />
            </Field>
            <Field label="Tag / Event">
              <input className={inputCls} value={form.tag_event ?? ''} placeholder="e.g. IMAX, 4DX" onChange={e => f('tag_event', e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Poster URL">
                <input className={inputCls} value={form.poster_url} onChange={e => f('poster_url', e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Banner URL">
                <input className={inputCls} value={form.banner_url} onChange={e => f('banner_url', e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Trailer URL">
                <input className={inputCls} value={form.trailer_url ?? ''} onChange={e => f('trailer_url', e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Synopsis">
                <textarea className={inputCls} rows={3} value={form.synopsis ?? ''} onChange={e => f('synopsis', e.target.value)} />
              </Field>
            </div>
            <Field label="Genres (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.genres)} onChange={e => f('genres', splitLines(e.target.value))} />
            </Field>
            <Field label="Starring (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.starring)} onChange={e => f('starring', splitLines(e.target.value))} />
            </Field>
            <Field label="Audio Languages (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.audio_languages)} onChange={e => f('audio_languages', splitLines(e.target.value))} />
            </Field>
            <Field label="Subtitle Languages (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.subtitle_languages)} onChange={e => f('subtitle_languages', splitLines(e.target.value))} />
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
