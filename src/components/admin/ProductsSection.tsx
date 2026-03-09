import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '@/services/api';
import type { Product, ProductCategory } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, ActiveIcon,
  inputCls,
  EditButton, DeactivateButton, ActivateButton,
} from './AdminShared';

const emptyProduct: Omit<Product, 'id'> = {
  name: '', category_id: '', price: 0, description: '', image_url: '', is_active: true, stock_quantity: 0,
};

type ModalMode = 'add' | 'edit' | null;
type SortKey = 'name' | 'price' | 'category';
type SortDir = 'asc' | 'desc';

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([productsApi.getAllProducts(), productsApi.getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function openAdd() {
    setForm(emptyProduct);
    setEditId(null);
    setModal('add');
    setError('');
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      category_id: p.category_id,
      price: typeof p.price === 'string' ? Number.parseFloat(p.price) : p.price,
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      is_active: p.is_active,
      stock_quantity: p.stock_quantity,
    });
    setEditId(p.id);
    setModal('edit');
    setError('');
  }

  async function handleToggleActive(p: Product) {
    const action = p.is_active ? 'Deactivate' : 'Activate';
    if (!confirm(`${action} "${p.name}"?`)) return;
    try {
      await productsApi.updateProduct(p.id, { is_active: !p.is_active });
      refresh();
    } catch (e: unknown) {
      alert(String(e));
    }
  }

  async function handleSubmit() {
    setError('');
    const payload = { ...form, image_url: form.image_url || undefined };
    try {
      if (modal === 'edit' && editId != null) {
        await productsApi.updateProduct(editId, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      setModal(null);
      refresh();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id;
  const f = (field: keyof Omit<Product, 'id'>, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const displayed = products
    .filter(p => {
      if (filterCategory && p.category_id !== filterCategory) return false;
      if (filterStatus === 'active' && !p.is_active) return false;
      if (filterStatus === 'inactive' && p.is_active) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'price') cmp = Number(a.price) - Number(b.price);
      else if (sortKey === 'category') cmp = catName(a.category_id).localeCompare(catName(b.category_id));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function SortHeader({ label, sk }: { label: string; sk: SortKey }) {
    const active = sortKey === sk;
    return (
      <button
        type="button"
        onClick={() => toggleSort(sk)}
        className={`flex items-center gap-1 font-semibold uppercase tracking-wide text-xs hover:text-neutral-900 transition-colors ${active ? 'text-neutral-900' : 'text-neutral-500'}`}
      >
        {label}
        <span className="text-[10px]">{active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
      </button>
    );
  }

  return (
    <div>
      <SectionHeader title="Products" count={displayed.length} onAdd={openAdd} addLabel="+ Add Product" />

      {/* Filters */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        <select
          className="border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-700 bg-white focus:outline-none focus:border-red-400"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className="border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-700 bg-white focus:outline-none focus:border-red-400"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
        >
          <option value="all">All Status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>

        {(filterCategory || filterStatus !== 'all') && (
          <button
            type="button"
            className="text-xs text-neutral-400 hover:text-neutral-700 underline"
            onClick={() => { setFilterCategory(''); setFilterStatus('all'); }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-3 py-2.5"><SortHeader label="Name" sk="name" /></th>
                <th className="px-3 py-2.5"><SortHeader label="Category" sk="category" /></th>
                <th className="px-3 py-2.5"><SortHeader label="Price (฿)" sk="price" /></th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-xs">Active</th>
                <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-neutral-400 text-center">No products found.</td></tr>
              )}
              {displayed.map(p => (
                <tr key={p.id} className={`border-t border-neutral-100 hover:bg-neutral-50 transition-colors ${!p.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">{p.name}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{catName(p.category_id)}</td>
                  <td className="px-3 py-2.5 text-neutral-600">฿{p.price}</td>
                  <td className="px-3 py-2.5"><ActiveIcon active={p.is_active} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <EditButton onClick={() => openEdit(p)} />
                      {p.is_active
                        ? <DeactivateButton onClick={() => handleToggleActive(p)} />
                        : <ActivateButton onClick={() => handleToggleActive(p)} />
                      }
                    </div>
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
              <input className={inputCls} value={form.name} onChange={e => f('name', e.target.value)} />
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.category_id} onChange={e => f('category_id', e.target.value)}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price (฿)">
              <input className={inputCls} type="number" step="0.01" min="0" value={form.price} onChange={e => f('price', +e.target.value)} />
            </Field>
            <Field label="Active">
              <select className={inputCls} value={form.is_active ? '1' : '0'} onChange={e => f('is_active', e.target.value === '1')}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </Field>
            <Field label="Stock Qty">
              <input className={inputCls} type="number" min="0" value={form.stock_quantity} onChange={e => f('stock_quantity', +e.target.value)} />
            </Field>
            <div className="col-span-2">
              <Field label="Image URL">
                <input className={inputCls} value={form.image_url ?? ''} placeholder="https://..." onChange={e => f('image_url', e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Description">
                <textarea className={inputCls} rows={2} value={form.description ?? ''} onChange={e => f('description', e.target.value)} />
              </Field>
            </div>
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
