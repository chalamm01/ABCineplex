import { useState, useEffect, useCallback } from 'react';
import { productsApi, type CategoryCreate, type Category } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead, ActiveIcon,
  inputCls, btnEdit, btnDanger,
} from './AdminShared';

const emptyCategory: CategoryCreate = { name: '', display_order: 0 };

type ModalMode = 'add' | 'edit' | null;

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<CategoryCreate>(emptyCategory);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    productsApi.getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm(emptyCategory);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(c: Category) {
    setForm({ name: c.name, display_order: c.display_order });
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

  return (
    <div>
      <SectionHeader title="Categories" count={categories.length} onAdd={openAdd} addLabel="+ Add Category" />

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <table className="w-full text-sm text-left">
          <TableHead cols={['Name', 'Display Order', 'Active', 'Actions']} />
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-zinc-500 text-center">No categories found.</td></tr>
            )}
            {categories.map(c => (
              <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="px-3 py-2 text-white font-medium">{c.name}</td>
                <td className="px-3 py-2 text-zinc-300">{c.display_order}</td>
                <td className="px-3 py-2"><ActiveIcon active={c.is_active} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button className={btnEdit} onClick={() => openEdit(c)}>Edit</button>
                    <button className={btnDanger} onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
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
              <input className={inputCls} type="number" min="0" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value })} />
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
