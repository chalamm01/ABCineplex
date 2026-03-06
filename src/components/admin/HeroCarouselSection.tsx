import { useState, useEffect, useCallback, useRef } from 'react';
import { publicApi, adminApi } from '@/services/api';
import type { HeroSlide, Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, ActiveIcon,
  inputCls,
  EditButton, DeleteButton,
} from './AdminShared';

type ContentType = 'movie' | 'promo';

interface SlideForm {
  image_url: string;
  title: string;
  description: string;
  cta_link: string;
  cta_text: string;
  display_order: number;
  is_active: boolean;
}

const emptySlide: SlideForm = {
  image_url: '', title: '', description: '', cta_link: '', cta_text: '', display_order: 0, is_active: true,
};

type ModalMode = 'add' | 'edit' | null;

export default function HeroCarouselSection() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<SlideForm>(emptySlide);
  const [contentType, setContentType] = useState<ContentType>('promo');
  const [selectedMovieId, setSelectedMovieId] = useState<number | ''>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([publicApi.getHeroCarousel(), adminApi.listMovies()])
      .then(([s, m]) => {
        setSlides([...s].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
        setMovies(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // ── Drag & drop handlers ──────────────────────────────────

  function onDragStart(index: number) { dragIndex.current = index; }
  function onDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setDragOver(index); }
  function onDragLeave() { setDragOver(null); }
  function onDragEnd() { dragIndex.current = null; setDragOver(null); }

  async function onDrop(dropIndex: number) {
    const fromIndex = dragIndex.current;
    dragIndex.current = null;
    setDragOver(null);
    if (fromIndex === null || fromIndex === dropIndex) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((s, i) => ({ ...s, display_order: i }));
    setSlides(updated);

    setSaving(true);
    try {
      const changed = updated.filter((s, i) => s.display_order !== slides[i]?.display_order || s.id !== slides[i]?.id);
      await Promise.all(changed.map(s => adminApi.updateHeroSlide(String(s.id), { display_order: s.display_order })));
    } catch {
      refresh();
    } finally {
      setSaving(false);
    }
  }

  function openAdd() {
    setForm({ ...emptySlide, display_order: slides.length });
    setEditId(null);
    setContentType('promo');
    setSelectedMovieId('');
    setModal('add');
    setError('');
  }

  function openEdit(s: HeroSlide) {
    setForm({
      image_url: s.image_url ?? '',
      title: s.title ?? '',
      description: s.description ?? '',
      cta_link: s.cta_link ?? '',
      cta_text: s.cta_text ?? '',
      display_order: s.display_order ?? 0,
      is_active: s.is_active,
    });
    setContentType('promo');
    setSelectedMovieId('');
    setEditId(String(s.id));
    setModal('edit');
    setError('');
  }

  function handleTypeChange(type: ContentType) {
    setContentType(type);
    setSelectedMovieId('');
    if (type === 'movie') {
      setForm(prev => ({ ...prev, cta_text: prev.cta_text || 'Book Now' }));
    }
  }

  function handleMovieSelect(id: number) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;
    setSelectedMovieId(id);
    setForm(prev => ({
      ...prev,
      image_url: movie.banner_url ?? movie.poster_url ?? '',
      title: movie.title,
      description: movie.synopsis?.slice(0, 150) ?? '',
      cta_link: `/movie/${movie.id}`,
      cta_text: prev.cta_text || 'Book Now',
    }));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this carousel slide?')) return;
    try {
      await adminApi.deleteHeroSlide(id);
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    if (!form.image_url.trim()) { setError('Image URL is required.'); return; }
    try {
      if (modal === 'edit' && editId != null) {
        await adminApi.updateHeroSlide(editId, form);
      } else {
        await adminApi.createHeroSlide(form);
      }
      setModal(null);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof SlideForm, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleCls = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
      active ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
    }`;

  return (
    <div>
      <SectionHeader title="Hero Carousel" count={slides.length} onAdd={openAdd} addLabel="+ Add Slide" />

      {saving && <p className="mb-2 text-xs text-blue-600">Saving order…</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : slides.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">No slides found.</p>
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_auto_auto_auto] gap-3 px-3 py-2 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span></span>
            <span>Title</span>
            <span>CTA</span>
            <span>Active</span>
            <span>Actions</span>
          </div>

          {slides.map((s, i) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(i)}
              onDragEnd={onDragEnd}
              className={`grid grid-cols-[2rem_1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 border-b border-neutral-100 last:border-b-0 transition-colors select-none ${
                dragOver === i ? 'bg-blue-50 border-blue-300' : 'hover:bg-neutral-50'
              } ${dragIndex.current === i ? 'opacity-40' : ''}`}
            >
              <span className="cursor-grab text-neutral-300 hover:text-neutral-500 text-lg leading-none" title="Drag to reorder">⠿</span>
              <span className="text-neutral-900 font-medium text-sm">
                {s.title || <span className="text-neutral-400 italic">—</span>}
              </span>
              <span className="text-neutral-600 text-xs">{s.cta_text || <span className="text-neutral-400 italic">—</span>}</span>
              <span><ActiveIcon active={s.is_active} /></span>
              <div className="flex gap-1">
                <EditButton onClick={() => openEdit(s)} />
                <DeleteButton onClick={() => handleDelete(s.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Slide' : 'Edit Slide'} onClose={() => setModal(null)}>

          {/* Type toggle */}
          <div className="flex gap-2 mb-5">
            <button type="button" className={toggleCls(contentType === 'movie')} onClick={() => handleTypeChange('movie')}>
              🎬 Movie
            </button>
            <button type="button" className={toggleCls(contentType === 'promo')} onClick={() => handleTypeChange('promo')}>
              📢 News / Promotion
            </button>
          </div>

          {/* Movie picker */}
          {contentType === 'movie' && (
            <div className="mb-4">
              <Field label="Select Movie (auto-fills fields below)">
                <select
                  className={inputCls}
                  value={selectedMovieId}
                  onChange={e => handleMovieSelect(+e.target.value)}
                >
                  <option value="">— Choose a movie —</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Title">
                <input className={inputCls} value={form.title} onChange={e => f('title', e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Image URL">
                <input className={inputCls} value={form.image_url} placeholder="https://..." onChange={e => f('image_url', e.target.value)} />
              </Field>
            </div>
            <Field label="CTA Button Text">
              <input className={inputCls} value={form.cta_text} placeholder="e.g. Book Now" onChange={e => f('cta_text', e.target.value)} />
            </Field>
            <Field label="CTA Link URL">
              <input className={inputCls} value={form.cta_link} placeholder="/movie/1" onChange={e => f('cta_link', e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Description">
                <textarea className={inputCls} rows={2} value={form.description} onChange={e => f('description', e.target.value)} />
              </Field>
            </div>
            <Field label="Active">
              <select className={inputCls} value={form.is_active ? '1' : '0'} onChange={e => f('is_active', e.target.value === '1')}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
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
