import { useState, useEffect, useCallback } from 'react';
import {
  moviesApi, showtimesApi, productsApi, publicApi,
  type MovieCreate, type ShowtimeCreate, type ProductCreate,
  type CategoryCreate, type Showtime, type Product, type Category,
} from '@/services/api';
import type { Movie, HeroCarouselItem, PromoEvent } from '@/types/api';

// ─── Generic helpers ──────────────────────────────────────────────────────────

function splitLines(val: string): string[] {
  return val.split('\n').map(s => s.trim()).filter(Boolean);
}

function joinLines(arr?: string[]): string {
  return (arr ?? []).join('\n');
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: Readonly<{ title: string; onClose: () => void; children: React.ReactNode }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Form field helpers ───────────────────────────────────────────────────────

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500";
const btnPrimary = "bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg";
const btnSecondary = "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium px-4 py-2 rounded-lg";
const btnDanger = "bg-red-900 hover:bg-red-800 text-red-300 text-xs font-medium px-2 py-1 rounded";
const btnEdit = "bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium px-2 py-1 rounded";

// ─── Status badge ─────────────────────────────────────────────────────────────

function Badge({ value }: Readonly<{ value: string }>) {
  const colors: Record<string, string> = {
    now_showing: 'bg-green-900 text-green-300',
    coming_soon: 'bg-blue-900 text-blue-300',
    ended: 'bg-zinc-700 text-zinc-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[value] ?? 'bg-zinc-700 text-zinc-300'}`}>
      {value}
    </span>
  );
}

// ─── MOVIES SECTION ───────────────────────────────────────────────────────────

const emptyMovie: MovieCreate = {
  title: '', release_date: '', duration_minutes: 0, content_rating: '',
  release_status: 'coming_soon', poster_url: '', banner_url: '',
  synopsis: '', director: '', starring: [], genres: [],
  audio_languages: [], subtitle_languages: [], imdb_score: undefined,
  trailer_url: '', tag_event: '',
};

function MoviesSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  type ModalState = 'add' | 'edit' | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<MovieCreate>(emptyMovie);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMovies = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    moviesApi.getMovies(0, 100).then(setMovies).catch(() => {}).finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() { setForm(emptyMovie); setEditId(null); setModal('add'); setError(''); }
  function openEdit(m: Movie) {
    setForm({
      title: m.title, release_date: m.release_date,
      duration_minutes: m.duration_minutes, content_rating: m.content_rating,
      release_status: m.release_status, poster_url: m.poster_url,
      banner_url: m.banner_url, synopsis: m.synopsis ?? '',
      director: m.director ?? '', starring: m.starring ?? [],
      genres: m.genres ?? [], audio_languages: m.audio_languages ?? [],
      subtitle_languages: m.subtitle_languages ?? [],
      imdb_score: m.imdb_score, trailer_url: m.trailer_url ?? '',
      tag_event: m.tag_event ?? '',
    });
    setEditId(m.id); setModal('edit'); setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this movie?')) return;
    try { await moviesApi.deleteMovie(id); fetchMovies(); } catch (e: unknown) { alert(e); }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId) await moviesApi.updateMovie(editId, form);
      else await moviesApi.createMovie(form);
      setModal(null); fetchMovies();
    } catch (e: unknown) { setError(String(e)); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">Movies ({movies.length})</h2>
        <button className={btnPrimary} onClick={openAdd}>+ Add Movie</button>
      </div>
      {loading ? <p className="text-zinc-400 text-sm">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Release</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-3 py-2 text-zinc-400">{m.id}</td>
                  <td className="px-3 py-2 text-white font-medium">{m.title}</td>
                  <td className="px-3 py-2"><Badge value={m.release_status} /></td>
                  <td className="px-3 py-2 text-zinc-300">{m.duration_minutes}m</td>
                  <td className="px-3 py-2 text-zinc-300">{m.content_rating}</td>
                  <td className="px-3 py-2 text-zinc-300">{m.release_date}</td>
                  <td className="px-3 py-2 flex gap-1">
                    <button className={btnEdit} onClick={() => openEdit(m)}>Edit</button>
                    <button className={btnDanger} onClick={() => handleDelete(m.id)}>Del</button>
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
              <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Release Date (YYYY-MM-DD)">
              <input className={inputCls} value={form.release_date} onChange={e => setForm({ ...form, release_date: e.target.value })} />
            </Field>
            <Field label="Duration (minutes)">
              <input className={inputCls} type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: +e.target.value })} />
            </Field>
            <Field label="Content Rating">
              <input className={inputCls} value={form.content_rating} placeholder="e.g. PG-13" onChange={e => setForm({ ...form, content_rating: e.target.value })} />
            </Field>
            <Field label="Release Status">
              <select className={inputCls} value={form.release_status} onChange={e => setForm({ ...form, release_status: e.target.value })}>
                <option value="coming_soon">Coming Soon</option>
                <option value="now_showing">Now Showing</option>
                <option value="ended">Ended</option>
              </select>
            </Field>
            <Field label="IMDB Score">
              <input className={inputCls} type="number" step="0.1" min="0" max="10" value={form.imdb_score ?? ''} onChange={e => setForm({ ...form, imdb_score: e.target.value ? +e.target.value : undefined })} />
            </Field>
            <Field label="Director">
              <input className={inputCls} value={form.director ?? ''} onChange={e => setForm({ ...form, director: e.target.value })} />
            </Field>
            <Field label="Tag Event">
              <input className={inputCls} value={form.tag_event ?? ''} placeholder="e.g. IMAX" onChange={e => setForm({ ...form, tag_event: e.target.value })} />
            </Field>
            <div className="col-span-2">
              <Field label="Poster URL">
                <input className={inputCls} value={form.poster_url} onChange={e => setForm({ ...form, poster_url: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Banner URL">
                <input className={inputCls} value={form.banner_url} onChange={e => setForm({ ...form, banner_url: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Trailer URL">
                <input className={inputCls} value={form.trailer_url ?? ''} onChange={e => setForm({ ...form, trailer_url: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Synopsis">
                <textarea className={inputCls} rows={3} value={form.synopsis ?? ''} onChange={e => setForm({ ...form, synopsis: e.target.value })} />
              </Field>
            </div>
            <Field label="Genres (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.genres)} onChange={e => setForm({ ...form, genres: splitLines(e.target.value) })} />
            </Field>
            <Field label="Starring (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.starring)} onChange={e => setForm({ ...form, starring: splitLines(e.target.value) })} />
            </Field>
            <Field label="Audio Languages (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.audio_languages)} onChange={e => setForm({ ...form, audio_languages: splitLines(e.target.value) })} />
            </Field>
            <Field label="Subtitle Languages (one per line)">
              <textarea className={inputCls} rows={2} value={joinLines(form.subtitle_languages)} onChange={e => setForm({ ...form, subtitle_languages: splitLines(e.target.value) })} />
            </Field>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button className={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button className={btnPrimary} onClick={handleSubmit}>{modal === 'add' ? 'Create' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SHOWTIMES SECTION ────────────────────────────────────────────────────────

const emptyShowtime: ShowtimeCreate = { movie_id: 0, screen_id: 0, start_time: '', base_price: 0 };

function ShowtimesSection() {
  type ModalState = 'add' | 'edit' | null;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<ShowtimeCreate>(emptyShowtime);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    moviesApi.getMovies(0, 100).then(setMovies).catch(() => {});
  }, []);

  async function loadShowtimes(movieId: number) {
    setLoading(true);
    try { setShowtimes(await showtimesApi.getShowtimesByMovie(movieId)); }
    catch { setShowtimes([]); }
    setLoading(false);
  }

  function onMovieChange(id: number) { setSelectedMovieId(id); loadShowtimes(id); }

  function openAdd() {
    setForm({ ...emptyShowtime, movie_id: selectedMovieId ?? 0 });
    setEditId(null); setModal('add'); setError('');
  }
  function openEdit(s: Showtime) {
    // Convert ISO to datetime-local format
    const dt = new Date(s.start_time);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ movie_id: s.movie_id, screen_id: s.screen_id, start_time: local, base_price: s.base_price });
    setEditId(s.id); setModal('edit'); setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this showtime?')) return;
    try { await showtimesApi.deleteShowtime(id); if (selectedMovieId) loadShowtimes(selectedMovieId); }
    catch (e: unknown) { alert(e); }
  }

  async function handleSubmit() {
    setError('');
    const payload = { ...form, start_time: new Date(form.start_time).toISOString() };
    try {
      if (modal === 'edit' && editId) await showtimesApi.updateShowtime(editId, payload);
      else await showtimesApi.createShowtime(payload);
      setModal(null); if (selectedMovieId) loadShowtimes(selectedMovieId);
    } catch (e: unknown) { setError(String(e)); }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-white font-semibold text-lg">Showtimes</h2>
        <select
          className={`${inputCls} w-64`}
          value={selectedMovieId ?? ''}
          onChange={e => onMovieChange(+e.target.value)}
        >
          <option value="">Select movie…</option>
          {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        {selectedMovieId && <button className={btnPrimary} onClick={openAdd}>+ Add Showtime</button>}
      </div>

      {selectedMovieId && (
        loading ? <p className="text-zinc-400 text-sm">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Screen</th>
                  <th className="px-3 py-2">Start Time</th>
                  <th className="px-3 py-2">Base Price</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-4 text-zinc-500 text-center">No showtimes found.</td></tr>
                )}
                {showtimes.map(s => (
                  <tr key={s.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                    <td className="px-3 py-2 text-zinc-400">{s.id}</td>
                    <td className="px-3 py-2 text-zinc-300">Screen {s.screen_id}</td>
                    <td className="px-3 py-2 text-white">{new Date(s.start_time).toLocaleString()}</td>
                    <td className="px-3 py-2 text-zinc-300">฿{s.base_price}</td>
                    <td className="px-3 py-2 flex gap-1">
                      <button className={btnEdit} onClick={() => openEdit(s)}>Edit</button>
                      <button className={btnDanger} onClick={() => handleDelete(s.id)}>Del</button>
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
              <select className={inputCls} value={form.movie_id} onChange={e => setForm({ ...form, movie_id: +e.target.value })}>
                {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </Field>
            <Field label="Screen ID">
              <input className={inputCls} type="number" value={form.screen_id} onChange={e => setForm({ ...form, screen_id: +e.target.value })} />
            </Field>
            <Field label="Start Time">
              <input className={inputCls} type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </Field>
            <Field label="Base Price (฿)">
              <input className={inputCls} type="number" step="0.01" value={form.base_price} onChange={e => setForm({ ...form, base_price: +e.target.value })} />
            </Field>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button className={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button className={btnPrimary} onClick={handleSubmit}>{modal === 'add' ? 'Create' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CATEGORIES SECTION ───────────────────────────────────────────────────────

const emptyCategory: CategoryCreate = { name: '', display_order: 0 };

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  type ModalState = 'add' | 'edit' | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<CategoryCreate>(emptyCategory);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCategories = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    productsApi.getCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() { setForm(emptyCategory); setEditId(null); setModal('add'); setError(''); }
  function openEdit(c: Category) { setForm({ name: c.name, display_order: c.display_order }); setEditId(c.id); setModal('edit'); setError(''); }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    try { await productsApi.deleteCategory(id); fetchCategories(); } catch (e: unknown) { alert(e); }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId) await productsApi.updateCategory(editId, form);
      else await productsApi.createCategory(form);
      setModal(null); fetchCategories();
    } catch (e: unknown) { setError(String(e)); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">Categories ({categories.length})</h2>
        <button className={btnPrimary} onClick={openAdd}>+ Add Category</button>
      </div>
      {loading ? <p className="text-zinc-400 text-sm">Loading…</p> : (
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="px-3 py-2 text-white">{c.name}</td>
                <td className="px-3 py-2 text-zinc-300">{c.display_order}</td>
                <td className="px-3 py-2">{c.is_active ? <span className="text-green-400">✓</span> : <span className="text-zinc-500">✗</span>}</td>
                <td className="px-3 py-2 flex gap-1">
                  <button className={btnEdit} onClick={() => openEdit(c)}>Edit</button>
                  <button className={btnDanger} onClick={() => handleDelete(c.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Category' : 'Edit Category'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Display Order">
              <input className={inputCls} type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value })} />
            </Field>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button className={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button className={btnPrimary} onClick={handleSubmit}>{modal === 'add' ? 'Create' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PRODUCTS SECTION ─────────────────────────────────────────────────────────

const emptyProduct: ProductCreate = { name: '', category_id: '', price: 0, description: '', image_url: '', in_stock: true };

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  type ModalState = 'add' | 'edit' | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<ProductCreate>(emptyProduct);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAll = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([productsApi.getProducts(), productsApi.getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() { setForm(emptyProduct); setEditId(null); setModal('add'); setError(''); }
  function openEdit(p: Product) {
    setForm({ name: p.name, category_id: p.category_id, price: Number.parseFloat(p.price), description: p.description ?? '', image_url: p.image_url ?? '', in_stock: p.in_stock });
    setEditId(p.id); setModal('edit'); setError('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try { await productsApi.deleteProduct(id); fetchAll(); } catch (e: unknown) { alert(e); }
  }

  async function handleSubmit() {
    setError('');
    const payload = { ...form, image_url: form.image_url || undefined };
    try {
      if (modal === 'edit' && editId) await productsApi.updateProduct(editId, payload);
      else await productsApi.createProduct(payload);
      setModal(null); fetchAll();
    } catch (e: unknown) { setError(String(e)); }
  }

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">Products ({products.length})</h2>
        <button className={btnPrimary} onClick={openAdd}>+ Add Product</button>
      </div>
      {loading ? <p className="text-zinc-400 text-sm">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">In Stock</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-3 py-2 text-white">{p.name}</td>
                  <td className="px-3 py-2 text-zinc-300">{catName(p.category_id)}</td>
                  <td className="px-3 py-2 text-zinc-300">฿{p.price}</td>
                  <td className="px-3 py-2">{p.in_stock ? <span className="text-green-400">✓</span> : <span className="text-zinc-500">✗</span>}</td>
                  <td className="px-3 py-2 flex gap-1">
                    <button className={btnEdit} onClick={() => openEdit(p)}>Edit</button>
                    <button className={btnDanger} onClick={() => handleDelete(p.id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price (฿)">
              <input className={inputCls} type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} />
            </Field>
            <Field label="In Stock">
              <select className={inputCls} value={form.in_stock ? '1' : '0'} onChange={e => setForm({ ...form, in_stock: e.target.value === '1' })}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Image URL">
                <input className={inputCls} value={form.image_url ?? ''} onChange={e => setForm({ ...form, image_url: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Description">
                <textarea className={inputCls} rows={2} value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button className={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button className={btnPrimary} onClick={handleSubmit}>{modal === 'add' ? 'Create' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── HERO CAROUSEL SECTION ────────────────────────────────────────────────────

function HeroCarouselSection() {
  const [slides, setSlides] = useState<HeroCarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  type ModalState = 'add' | 'edit' | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<Record<string, string | boolean | number>>({
    banner_url: '', content_type: 'movie', title: '', target_url: '', display_order: 0, is_active: true,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSlides = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    publicApi.getHeroCarousel().then(setSlides).catch(() => {}).finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() { setForm({ banner_url: '', content_type: 'movie', title: '', target_url: '', display_order: 0, is_active: true }); setEditId(null); setModal('add'); setError(''); }
  function openEdit(s: HeroCarouselItem) {
    setForm({ banner_url: s.banner_url, content_type: s.content_type, title: s.title ?? '', target_url: s.target_url ?? '', display_order: s.display_order, is_active: s.is_active });
    setEditId(String(s.id)); setModal('edit'); setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this slide?')) return;
    try { await publicApi.deleteHeroSlide(String(id)); fetchSlides(); } catch (e: unknown) { alert(e); }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId) await publicApi.updateHeroSlide(editId, form);
      else await publicApi.createHeroSlide(form);
      setModal(null); fetchSlides();
    } catch (e: unknown) { setError(String(e)); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">Hero Carousel ({slides.length})</h2>
        <button className={btnPrimary} onClick={openAdd}>+ Add Slide</button>
      </div>
      {loading ? <p className="text-zinc-400 text-sm">Loading…</p> : (
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slides.map(s => (
              <tr key={s.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="px-3 py-2 text-zinc-300">{s.display_order}</td>
                <td className="px-3 py-2 text-white">{s.title || <span className="text-zinc-500 italic">—</span>}</td>
                <td className="px-3 py-2 text-zinc-300">{s.content_type}</td>
                <td className="px-3 py-2">{s.is_active ? <span className="text-green-400">✓</span> : <span className="text-zinc-500">✗</span>}</td>
                <td className="px-3 py-2 flex gap-1">
                  <button className={btnEdit} onClick={() => openEdit(s)}>Edit</button>
                  <button className={btnDanger} onClick={() => handleDelete(s.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Slide' : 'Edit Slide'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inputCls} value={String(form.title)} onChange={e => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Content Type">
              <input className={inputCls} value={String(form.content_type)} placeholder="movie / promo" onChange={e => setForm({ ...form, content_type: e.target.value })} />
            </Field>
            <div className="col-span-2"><Field label="Banner URL">
              <input className={inputCls} value={String(form.banner_url)} onChange={e => setForm({ ...form, banner_url: e.target.value })} />
            </Field></div>
            <div className="col-span-2"><Field label="Target URL">
              <input className={inputCls} value={String(form.target_url)} onChange={e => setForm({ ...form, target_url: e.target.value })} />
            </Field></div>
            <Field label="Display Order">
              <input className={inputCls} type="number" value={Number(form.display_order)} onChange={e => setForm({ ...form, display_order: +e.target.value })} />
            </Field>
            <Field label="Active">
              <select className={inputCls} value={form.is_active ? '1' : '0'} onChange={e => setForm({ ...form, is_active: e.target.value === '1' })}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </Field>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button className={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button className={btnPrimary} onClick={handleSubmit}>{modal === 'add' ? 'Create' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PROMO EVENTS SECTION ─────────────────────────────────────────────────────

function PromoEventsSection() {
  const [promos, setPromos] = useState<PromoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  type ModalState = 'add' | 'edit' | null;
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({ title: '', promo_type: '', image_url: '', is_active: true });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPromos = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    publicApi.getPromoEvents().then(setPromos).catch(() => {}).finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() { setForm({ title: '', promo_type: '', image_url: '', is_active: true }); setEditId(null); setModal('add'); setError(''); }
  function openEdit(p: PromoEvent) {
    setForm({ title: p.title, promo_type: p.promo_type, image_url: p.image_url, is_active: p.is_active });
    setEditId(String(p.id)); setModal('edit'); setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this promo?')) return;
    try { await publicApi.deletePromoEvent(String(id)); fetchPromos(); } catch (e: unknown) { alert(e); }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId) await publicApi.updatePromoEvent(editId, form);
      else await publicApi.createPromoEvent(form);
      setModal(null); fetchPromos();
    } catch (e: unknown) { setError(String(e)); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold text-lg">Promo Events ({promos.length})</h2>
        <button className={btnPrimary} onClick={openAdd}>+ Add Promo</button>
      </div>
      {loading ? <p className="text-zinc-400 text-sm">Loading…</p> : (
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map(p => (
              <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="px-3 py-2 text-white">{p.title}</td>
                <td className="px-3 py-2 text-zinc-300">{p.promo_type}</td>
                <td className="px-3 py-2">{p.is_active ? <span className="text-green-400">✓</span> : <span className="text-zinc-500">✗</span>}</td>
                <td className="px-3 py-2 flex gap-1">
                  <button className={btnEdit} onClick={() => openEdit(p)}>Edit</button>
                  <button className={btnDanger} onClick={() => handleDelete(p.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Promo' : 'Edit Promo'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inputCls} value={String(form.title)} onChange={e => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Promo Type">
              <input className={inputCls} value={String(form.promo_type)} onChange={e => setForm({ ...form, promo_type: e.target.value })} />
            </Field>
            <div className="col-span-2"><Field label="Image URL">
              <input className={inputCls} value={String(form.image_url)} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            </Field></div>
            <Field label="Active">
              <select className={inputCls} value={form.is_active ? '1' : '0'} onChange={e => setForm({ ...form, is_active: e.target.value === '1' })}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </Field>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button className={btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button className={btnPrimary} onClick={handleSubmit}>{modal === 'add' ? 'Create' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

type Tab = 'movies' | 'showtimes' | 'products' | 'categories' | 'hero' | 'promos';

const TABS: { id: Tab; label: string }[] = [
  { id: 'movies', label: 'Movies' },
  { id: 'showtimes', label: 'Showtimes' },
  { id: 'categories', label: 'Categories' },
  { id: 'products', label: 'Products' },
  { id: 'hero', label: 'Hero Carousel' },
  { id: 'promos', label: 'Promo Events' },
];

export default function Admin() {
  const [tab, setTab] = useState<Tab>('movies');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>

        {/* Tab bar */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          {tab === 'movies' && <MoviesSection />}
          {tab === 'showtimes' && <ShowtimesSection />}
          {tab === 'categories' && <CategoriesSection />}
          {tab === 'products' && <ProductsSection />}
          {tab === 'hero' && <HeroCarouselSection />}
          {tab === 'promos' && <PromoEventsSection />}
        </div>
      </div>
    </div>
  );
}
