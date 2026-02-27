import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '@/services/api';
import type { HeroCarouselItem } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead, ActiveIcon,
  inputCls, btnEdit, btnDanger,
} from './AdminShared';

interface SlideForm {
  banner_url: string;
  content_type: string;
  title: string;
  target_url: string;
  display_order: number;
  is_active: boolean;
}

const emptySlide: SlideForm = {
  banner_url: '', content_type: 'movie', title: '', target_url: '', display_order: 0, is_active: true,
};

type ModalMode = 'add' | 'edit' | null;

export default function HeroCarouselSection() {
  const [slides, setSlides] = useState<HeroCarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<SlideForm>(emptySlide);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    publicApi.getHeroCarousel()
      .then(setSlides)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm(emptySlide);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(s: HeroCarouselItem) {
    setForm({
      banner_url: s.banner_url,
      content_type: s.content_type,
      title: s.title ?? '',
      target_url: s.target_url ?? '',
      display_order: s.display_order,
      is_active: s.is_active,
    });
    setEditId(String(s.id));
    setModal('edit');
    setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this carousel slide?')) return;
    try {
      await publicApi.deleteHeroSlide(String(id));
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId != null) {
        await publicApi.updateHeroSlide(editId, form);
      } else {
        await publicApi.createHeroSlide(form);
      }
      setModal(null);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof SlideForm, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <SectionHeader title="Hero Carousel" count={slides.length} onAdd={openAdd} addLabel="+ Add Slide" />

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <table className="w-full text-sm text-left">
          <TableHead cols={['Order', 'Title', 'Type', 'Active', 'Actions']} />
          <tbody>
            {slides.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-zinc-500 text-center">No slides found.</td></tr>
            )}
            {slides.map(s => (
              <tr key={s.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="px-3 py-2 text-zinc-300">{s.display_order}</td>
                <td className="px-3 py-2 text-white">
                  {s.title || <span className="text-zinc-500 italic">—</span>}
                </td>
                <td className="px-3 py-2 text-zinc-300">{s.content_type}</td>
                <td className="px-3 py-2"><ActiveIcon active={s.is_active} /></td>
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
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Slide' : 'Edit Slide'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={e => f('title', e.target.value)} />
            </Field>
            <Field label="Content Type">
              <select className={inputCls} value={form.content_type} onChange={e => f('content_type', e.target.value)}>
                <option value="movie">Movie</option>
                <option value="promo">Promo</option>
                <option value="event">Event</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Banner Image URL">
                <input className={inputCls} value={form.banner_url} placeholder="https://..." onChange={e => f('banner_url', e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Target URL (where clicking leads)">
                <input className={inputCls} value={form.target_url} placeholder="https://... or /movie/1" onChange={e => f('target_url', e.target.value)} />
              </Field>
            </div>
            <Field label="Display Order">
              <input className={inputCls} type="number" min="0" value={form.display_order} onChange={e => f('display_order', +e.target.value)} />
            </Field>
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
