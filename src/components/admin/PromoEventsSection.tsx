import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '@/services/api';
import type { PromoEvent } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead, ActiveIcon,
  inputCls, btnEdit, btnDanger,
} from './AdminShared';

interface PromoForm {
  title: string;
  promo_type: string;
  image_url: string;
  is_active: boolean;
}

const emptyPromo: PromoForm = { title: '', promo_type: '', image_url: '', is_active: true };

type ModalMode = 'add' | 'edit' | null;

export default function PromoEventsSection() {
  const [promos, setPromos] = useState<PromoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<PromoForm>(emptyPromo);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    publicApi.getPromoEvents()
      .then(setPromos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm(emptyPromo);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(p: PromoEvent) {
    setForm({ title: p.title, promo_type: p.promo_type, image_url: p.image_url, is_active: p.is_active });
    setEditId(String(p.id));
    setModal('edit');
    setError('');
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this promo event?')) return;
    try {
      await publicApi.deletePromoEvent(String(id));
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId != null) {
        await publicApi.updatePromoEvent(editId, form);
      } else {
        await publicApi.createPromoEvent(form);
      }
      setModal(null);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const f = (field: keyof PromoForm, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <SectionHeader title="Promo Events" count={promos.length} onAdd={openAdd} addLabel="+ Add Promo" />

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <table className="w-full text-sm text-left">
          <TableHead cols={['Title', 'Type', 'Active', 'Actions']} />
          <tbody>
            {promos.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-zinc-500 text-center">No promo events found.</td></tr>
            )}
            {promos.map(p => (
              <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="px-3 py-2 text-white font-medium">{p.title}</td>
                <td className="px-3 py-2 text-zinc-300">{p.promo_type}</td>
                <td className="px-3 py-2"><ActiveIcon active={p.is_active} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className={btnEdit} onClick={() => openEdit(p)}>Edit</button>
                    <button className={btnDanger} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Promo Event' : 'Edit Promo Event'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={e => f('title', e.target.value)} />
            </Field>
            <Field label="Promo Type">
              <input className={inputCls} value={form.promo_type} placeholder="e.g. discount, loyalty, seasonal" onChange={e => f('promo_type', e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Image URL">
                <input className={inputCls} value={form.image_url} placeholder="https://..." onChange={e => f('image_url', e.target.value)} />
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
