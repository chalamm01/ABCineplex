import { useState, useEffect, useCallback, useRef } from 'react';
import { productsApi, type CategoryCreate, type Category } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, ActiveIcon,
  inputCls,
  EditButton, DeleteButton,
} from './AdminShared';

const emptyCategory: CategoryCreate = { name: '', display_order: 0, is_active: true };

type ModalMode = 'add' | 'edit' | null;

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<CategoryCreate>(emptyCategory);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    productsApi.getCategories()
      .then(cats => setCategories([...cats].sort((a, b) => a.display_order - b.display_order)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm({ name: '', display_order: categories.length, is_active: true });
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(c: Category) {
    setForm({ name: c.name, display_order: c.display_order, is_active: c.is_active });
    setEditId(c.id);
    setModal('edit');
    setError('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products in this category may be affected.')) return;
    try {
      await productsApi.deleteCategory(id);
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    try {
      if (modal === 'edit' && editId != null) {
        await productsApi.updateCategory(editId, form);
      } else {
        await productsApi.createCategory(form);
      }
      setModal(null);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  // ── Drag & drop handlers ──────────────────────────────────

  function onDragStart(index: number) {
    dragIndex.current = index;
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOver(index);
  }

  function onDragLeave() {
    setDragOver(null);
  }

  async function onDrop(dropIndex: number) {
    const fromIndex = dragIndex.current;
    dragIndex.current = null;
    setDragOver(null);
    if (fromIndex === null || fromIndex === dropIndex) return;

    // Reorder locally
    const reordered = [...categories];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Assign new display_order values (0-based sequential)
    const updated = reordered.map((c, i) => ({ ...c, display_order: i }));
    setCategories(updated);

    // Persist only changed items
    setSaving(true);
    try {
      const changed = updated.filter((c, i) => c.display_order !== categories[i]?.display_order || c.id !== categories[i]?.id);
      await Promise.all(changed.map(c => productsApi.updateCategory(c.id, { display_order: c.display_order })));
    } catch {
      // Revert on failure
      refresh();
    } finally {
      setSaving(false);
    }
  }

  function onDragEnd() {
    dragIndex.current = null;
    setDragOver(null);
  }

  return (
    <div>
      <SectionHeader title="Categories" count={categories.length} onAdd={openAdd} addLabel="+ Add Category" />
      {saving && <p className="mb-2 text-xs text-blue-600">Saving order…</p>}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">No categories found.</p>
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-3 py-2 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            <span></span>
            <span>Name</span>
            <span>Active</span>
            <span>Actions</span>
          </div>

          {categories.map((c, i) => (
            <div
              key={c.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(i)}
              onDragEnd={onDragEnd}
              className={`grid grid-cols-[2rem_1fr_auto_auto] gap-3 items-center px-3 py-2.5 border-b border-neutral-100 last:border-b-0 transition-colors select-none ${
                dragOver === i ? 'bg-blue-50 border-blue-300' : 'hover:bg-neutral-50'
              } ${dragIndex.current === i ? 'opacity-40' : ''}`}
            >
              {/* Drag handle */}
              <span className="cursor-grab text-neutral-300 hover:text-neutral-500 text-lg leading-none" title="Drag to reorder">
                ⠿
              </span>
              <span className="text-neutral-900 font-medium text-sm">{c.name}</span>
              <span><ActiveIcon active={c.is_active} /></span>
              <div className="flex gap-1">
                <EditButton onClick={() => openEdit(c)} />
                <DeleteButton onClick={() => handleDelete(c.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Category' : 'Edit Category'} onClose={() => setModal(null)}>
          <div className="grid grid-cols-1 gap-3">
            <Field label="Name">
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
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
