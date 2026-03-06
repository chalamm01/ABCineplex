import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '@/services/api';
import type { Product, ProductCategory } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead, ActiveIcon,
  inputCls,
  EditButton, DeleteButton,
} from './AdminShared';

const emptyProduct: Omit<Product, 'id'> = {
  name: '', category_id: '', price: 0, description: '', image_url: '', is_active: true, stock_quantity: 0,
};

type ModalMode = 'add' | 'edit' | null;

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    // Admin fetches ALL products (including out-of-stock)
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

  async function handleDelete(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await productsApi.deleteProduct(id);
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

  return (
    <div>
      <SectionHeader title="Products" count={products.length} onAdd={openAdd} addLabel="+ Add Product" />

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-neutral-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm text-left">
            <TableHead cols={['Name', 'Category', 'Price (฿)', 'In Stock', 'Actions']} />
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-neutral-400 text-center">No products found.</td></tr>
              )}
              {products.map(p => (
                <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-3 py-2.5 text-neutral-900 font-medium">{p.name}</td>
                  <td className="px-3 py-2.5 text-neutral-600">{catName(p.category_id)}</td>
                  <td className="px-3 py-2.5 text-neutral-600">฿{p.price}</td>
                  <td className="px-3 py-2.5"><ActiveIcon active={p.is_active} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <EditButton onClick={() => openEdit(p)} />
                      <DeleteButton onClick={() => handleDelete(p.id)} />
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
