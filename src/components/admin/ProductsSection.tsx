import { useState, useEffect, useCallback } from 'react';
import { productsApi, type ProductCreate, type Product, type Category } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import {
  Modal, Field, ModalActions, SectionHeader, TableHead, ActiveIcon,
  inputCls, btnEdit, btnDanger,
} from './AdminShared';

const emptyProduct: ProductCreate = {
  name: '', category_id: '', price: 0, description: '', image_url: '', in_stock: true,
};

type ModalMode = 'add' | 'edit' | null;

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState<ProductCreate>(emptyProduct);
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
      price: Number.parseFloat(p.price),
      description: p.description ?? '',
      image_url: p.image_url ?? '',
      in_stock: p.in_stock,
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
  const f = (field: keyof ProductCreate, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <SectionHeader title="Products" count={products.length} onAdd={openAdd} addLabel="+ Add Product" />

      {loading ? (
        <div className="flex justify-center py-8"><Spinner className="text-zinc-400 w-6 h-6" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <TableHead cols={['Name', 'Category', 'Price (฿)', 'In Stock', 'Actions']} />
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-zinc-500 text-center">No products found.</td></tr>
              )}
              {products.map(p => (
                <tr key={p.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                  <td className="px-3 py-2 text-white font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-zinc-300">{catName(p.category_id)}</td>
                  <td className="px-3 py-2 text-zinc-300">฿{p.price}</td>
                  <td className="px-3 py-2"><ActiveIcon active={p.in_stock} /></td>
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
            <Field label="In Stock">
              <select className={inputCls} value={form.in_stock ? '1' : '0'} onChange={e => f('in_stock', e.target.value === '1')}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
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
