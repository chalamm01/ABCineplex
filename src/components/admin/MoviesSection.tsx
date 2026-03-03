import { useState, useEffect, useCallback } from 'react';
import { moviesApi, adminApi, type MovieCreate } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, StatusBadge,
  inputCls, btnEdit, btnDanger, joinLines, splitLines, useSort, SortableTableHead,
} from './AdminShared';

// Aligned with the provided schema keys
const emptyMovie: MovieCreate = {
  title: '',
  release_date: '',
  runtime_minutes: 0,
  duration_minutes: 0,
  credits_duration_minutes: 0,
  content_rating: '',
  release_status: 'upcoming',
  poster_url: '',
  banner_url: '',
  synopsis: '',
  director: '',
  starring: [],
  genre: '', // Schema uses singular 'genre'
  audio_languages: [],
  subtitle_languages: [],
  imdb_score: undefined,
  trailer_url: '',
  tag_event: '',
  is_active: true,
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
  const [search, setSearch] = useState('');
  const [tmdbId, setTmdbId] = useState('');
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    adminApi.listMovies()
      .then((data) => setMovies(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Fetch error:", err);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm(emptyMovie);
    setEditId(null);
    setModal('add');
    setError('');
    setTmdbId('');
    setTmdbError('');
  }

  function openEdit(m: Movie) {
    setForm({
      title: m.title,
      release_date: m.release_date || '',
      runtime_minutes: m.runtime_minutes || 0,
      duration_minutes: m.duration_minutes || 0,
      credits_duration_minutes: m.credits_duration_minutes || 0,
      content_rating: m.content_rating || '',
      release_status: m.release_status || 'upcoming',
      poster_url: m.poster_url || '',
      banner_url: m.banner_url || '',
      synopsis: m.synopsis || '',
      director: m.director || '',
      starring: m.starring || [],
      genre: m.genre || '', // Mapped from schema
      audio_languages: m.audio_languages || [],
      subtitle_languages: m.subtitle_languages || [],
      imdb_score: m.imdb_score,
      trailer_url: m.trailer_url || '',
      tag_event: m.tag_event || '',
      is_active: m.is_active ?? true,
    });
    setEditId(m.id);
    setModal('edit');
    setError('');
    setTmdbId('');
    setTmdbError('');
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

  async function handleToggleActive(m: Movie) {
    const next = !(m.is_active ?? true);
    const label = next ? 'unhide' : 'hide';
    if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} "${m.title}"? ${next ? 'It will appear on the public site.' : 'It will be hidden from customers.'}`)) return;
    try {
      await adminApi.toggleMovieActive(m.id, next);
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleFetchTmdb() {
    const id = parseInt(tmdbId, 10);
    if (!id) { setTmdbError('Enter a valid TMDB movie ID'); return; }
    setTmdbLoading(true);
    setTmdbError('');
    try {
      const data = await adminApi.fetchFromTmdb(id);
      setForm(prev => ({
        ...prev,
        title:                  data.title                  ?? prev.title,
        synopsis:               data.synopsis               ?? prev.synopsis,
        release_date:           data.release_date           ?? prev.release_date,
        runtime_minutes:        data.runtime_minutes        ?? prev.runtime_minutes,
        duration_minutes:       data.duration_minutes       ?? prev.duration_minutes,
        credits_duration_minutes: data.credits_duration_minutes ?? prev.credits_duration_minutes,
        imdb_score:             data.imdb_score             ?? prev.imdb_score,
        genre:                  data.genre                  ?? prev.genre,
        director:               data.director               ?? prev.director,
        starring:               data.starring               ?? prev.starring,
        poster_url:             data.poster_url             ?? prev.poster_url,
        banner_url:             data.banner_url             ?? prev.banner_url,
        trailer_url:            data.trailer_url            ?? prev.trailer_url,
        release_status:         data.release_status         ?? prev.release_status,
      }));
    } catch (e: unknown) {
      setTmdbError(e instanceof Error ? e.message : 'Failed to fetch from TMDB');
    } finally {
      setTmdbLoading(false);
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

  const filteredMovies = movies.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.director ?? '').toLowerCase().includes(q) ||
      (m.genre ?? '').toLowerCase().includes(q)
    );
  });

  const { sorted, sort, toggle } = useSort(filteredMovies);

  return (
    <div>
      <SectionHeader title="Movies" count={movies.length} onAdd={openAdd} addLabel="+ Add Movie" />

      <div className="mb-4">
        <input
          className={inputCls}
          style={{ maxWidth: '320px' }}
          placeholder="Search by title, director, genre…"
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
                { label: 'ID',           key: 'id' },
                { label: 'Title',        key: 'title' },
                { label: 'Status',       key: 'release_status' },
                { label: 'Visible',      key: 'is_active' },
                { label: 'Runtime',      key: 'runtime_minutes' },
                { label: 'Rating',       key: 'imdb_score' },
                { label: 'Release Date', key: 'release_date' },
                { label: 'Actions',      key: '' },
              ]}
            />
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-neutral-400 text-center">No movies found.</td></tr>
              )}
              {sorted.map(m => (
                <tr key={m.id} className={`border-t border-neutral-100 hover:bg-neutral-50 transition-colors ${
                  (m.is_active ?? true) ? '' : 'opacity-60'
                }`}>
                  <td className="px-3 py-2.5 text-neutral-400">{m.id}</td>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">{m.title}</td>
                  <td className="px-3 py-2.5"><StatusBadge value={m.release_status ?? ''} /></td>
                  <td className="px-3 py-2.5">
                    {(m.is_active ?? true)
                      ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Visible</span>
                      : <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-500">Hidden</span>
                    }
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{m.runtime_minutes}m</td>
                  <td className="px-3 py-2.5 text-neutral-600">{m.content_rating}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{m.release_date}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button className={btnEdit} onClick={() => openEdit(m)}>Edit</button>
                      <button
                        className="rounded px-2 py-1 text-xs font-medium border transition-colors border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                        onClick={() => handleToggleActive(m)}
                      >
                        {(m.is_active ?? true) ? 'Hide' : 'Show'}
                      </button>
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
          {/* TMDB Autofill */}
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="mb-2 text-xs font-semibold text-blue-700 uppercase tracking-wide">Autofill from TMDB</p>
            <div className="flex gap-2 items-center">
              <input
                className={inputCls + ' flex-1'}
                placeholder="TMDB Movie ID (e.g. 157336)"
                value={tmdbId}
                onChange={e => { setTmdbId(e.target.value); setTmdbError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleFetchTmdb()}
              />
              <button
                disabled={tmdbLoading || !tmdbId}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                onClick={handleFetchTmdb}
              >
                {tmdbLoading ? 'Fetching…' : 'Fetch'}
              </button>
            </div>
            {tmdbError && <p className="mt-1 text-xs text-red-600">{tmdbError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={e => f('title', e.target.value)} />
            </Field>
            <Field label="Release Date">
              <input className={inputCls} type="date" value={form.release_date} onChange={e => f('release_date', e.target.value)} />
            </Field>
            <Field label="Runtime (minutes)">
              <input className={inputCls} type="number" min="0" value={form.runtime_minutes} onChange={e => f('runtime_minutes', +e.target.value)} />
            </Field>
            <Field label="Total Duration (incl. ads)">
              <input className={inputCls} type="number" min="0" value={form.duration_minutes} onChange={e => f('duration_minutes', +e.target.value)} />
            </Field>
            <Field label="Content Rating">
              <input className={inputCls} value={form.content_rating} placeholder="e.g. PG-13" onChange={e => f('content_rating', e.target.value)} />
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.release_status} onChange={e => f('release_status', e.target.value)}>
                <option value="upcoming">Coming Soon</option>
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
            <Field label="Credits Duration (mins)">
              <input className={inputCls} type="number" min="0" value={form.credits_duration_minutes ?? 0} onChange={e => f('credits_duration_minutes', +e.target.value)} />
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
            <Field label="Genre">
              <input className={inputCls} value={form.genre ?? ''} onChange={e => f('genre', e.target.value)} />
            </Field>
            <Field label="Director">
              <input className={inputCls} value={form.director ?? ''} onChange={e => f('director', e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Synopsis">
                <textarea className={inputCls} rows={3} value={form.synopsis ?? ''} onChange={e => f('synopsis', e.target.value)} />
              </Field>
            </div>
            <Field label="Starring (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.starring || [])} onChange={e => f('starring', splitLines(e.target.value))} />
            </Field>
            <Field label="Audio Languages (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.audio_languages || [])} onChange={e => f('audio_languages', splitLines(e.target.value))} />
            </Field>
            <Field label="Subtitle Languages (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.subtitle_languages || [])} onChange={e => f('subtitle_languages', splitLines(e.target.value))} />
            </Field>
            <Field label="Tag / Event">
              <input className={inputCls} value={form.tag_event ?? ''} placeholder="e.g. IMAX" onChange={e => f('tag_event', e.target.value)} />
            </Field>
            <Field label="Trailer URL">
              <input className={inputCls} value={form.trailer_url ?? ''} onChange={e => f('trailer_url', e.target.value)} />
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