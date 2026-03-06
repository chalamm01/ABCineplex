import { useContext, useEffect, useRef, useState } from "react";
import { CartContext } from "@/providers/CartContextDef";
import { useNavigate } from "react-router-dom";
import { productsApi } from "@/services/api";
import type { Product, ProductCategory } from "@/types/api";
import { ShoppingCart, Plus } from "lucide-react";

// ── Item Detail Modal ──────────────────────────────────────────────────────────
function ItemModal({
  item,
  onClose,
  onAdd,
}: {
  item: Product;
  onClose: () => void;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 flex justify-center py-8 px-4">
          <img
            src={item.image_url ?? '/assets/images/placeholder.png'}
            alt={item.name}
            className="h-44 w-44 object-contain drop-shadow-md"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h2>
          {item.description && (
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{item.description}</p>
          )}
          <p className="text-3xl font-extrabold text-violet-700 mb-6">
            {Number(item.price).toLocaleString()} <span className="text-lg font-semibold text-violet-400">THB</span>
          </p>

          {/* Quantity stepper */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-900 font-bold text-xl flex items-center justify-center transition-colors"
            >
              −
            </button>
            <span className="text-2xl font-bold w-8 text-center tabular-nums">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-10 h-10 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-900 font-bold text-xl flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => { onAdd(qty); onClose(); }}
            className="w-full bg-violet-900 hover:bg-violet-800 active:scale-95 text-white font-bold py-3 rounded-2xl text-base transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add {qty > 1 ? `${qty} items` : 'to Cart'} — {(Number(item.price) * qty).toLocaleString()} THB
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 flex items-center justify-center text-lg leading-none transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ item, onSelect }: { item: Product; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center h-44 p-4 overflow-hidden">
        <img
          src={item.image_url ?? '/assets/images/placeholder.png'}
          alt={item.name}
          className="h-36 w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1">{item.name}</p>
        {item.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">{item.description}</p>
        )}
        {!item.description && <div className="flex-1" />}
        <div className="flex items-center justify-between mt-2">
          <span className="text-violet-700 font-extrabold text-base">
            {Number(item.price).toLocaleString()} <span className="text-xs font-semibold text-violet-400">THB</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-8 h-8 bg-violet-900 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-5 bg-slate-100 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

// ── Main Snacks Page ───────────────────────────────────────────────────────────
function Snacks() {
  const context = useContext(CartContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Refs for section scroll
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.getAllProducts(100),
      productsApi.getCategories(),
    ])
      .then(([prods, cats]) => {
        const sorted = [...cats].sort((a, b) => a.display_order - b.display_order);
        setProducts(prods);
        setCategories(sorted);
        if (sorted.length > 0) setActiveCategoryId(sorted[0].id);
      })
      .catch(() => setError('Failed to load snacks.'))
      .finally(() => setLoading(false));
  }, []);

  if (!context) throw new Error("CartContext must be used inside CartProvider");
  const { cart, addToCart } = context;

  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);

  const grouped = categories.map((cat) => ({
    category: cat,
    items: products.filter((p) => p.category_id === cat.id && p.is_active),
  })).filter((g) => g.items.length > 0);

  const filteredGroups = activeCategoryId === 'all' || !activeCategoryId
    ? grouped
    : grouped.filter((g) => g.category.id === activeCategoryId);

  const scrollToCategory = (catId: string) => {
    setActiveCategoryId(catId);
    const el = sectionRefs.current[catId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen bg-white/75 backdrop-blur-md">

        {/* ── Hero Banner ── */}
        <div className="relative bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/background/bg_snackbar.png')] bg-cover bg-center opacity-20" />
          <div className="relative max-w-5xl mx-auto px-6 py-14 text-center">
            <p className="text-violet-300 text-sm font-semibold uppercase tracking-widest mb-2">ABCineplex</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Snack Bar</h1>
            <p className="text-violet-200 text-base max-w-md mx-auto">
              Order popcorn, drinks &amp; combos for pickup at the counter — ready before the show.
            </p>
          </div>
        </div>

        {/* ── Category Pill Tabs ── */}
        {!loading && !error && categories.length > 0 && (
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {grouped.map(({ category }) => (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeCategoryId === category.id
                      ? 'bg-violet-900 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-violet-100 hover:text-violet-900'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 pb-32">

          {loading && (
            <div>
              {[1, 2].map((g) => (
                <div key={g} className="mb-12">
                  <div className="h-7 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xl text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-violet-900 text-white rounded-xl font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-slate-400 text-lg">No items available in this category.</p>
            </div>
          )}

          {!loading && !error && filteredGroups.map(({ category, items }) => (
            <div
              key={category.id}
              ref={(el) => { sectionRefs.current[category.id] = el; }}
              className="mb-14 scroll-mt-20"
            >
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{category.name}</h2>
                <span className="text-sm text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating Cart Button ── */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-violet-900 hover:bg-violet-800 active:scale-95 text-white px-6 py-3.5 rounded-2xl shadow-2xl transition-all font-semibold"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          </div>
          <span>View Cart</span>
          <span className="bg-white/20 rounded-xl px-2.5 py-0.5 text-sm font-bold">
            {cartTotal.toLocaleString()} THB
          </span>
        </button>
      )}

      {/* ── Item Modal ── */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(qty) => {
            for (let i = 0; i < qty; i++) {
              addToCart({
                id: selectedItem.id,
                name: selectedItem.name,
                price: Number(selectedItem.price),
                image: selectedItem.image_url ?? '/assets/images/placeholder.png',
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default Snacks;
