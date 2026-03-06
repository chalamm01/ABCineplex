import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/providers/CartContextDef";
import { useNavigate } from "react-router-dom";
import { productsApi } from "@/services/api";
import type { Product, ProductCategory } from "@/types/api";
import { Spinner } from '@/components/ui/spinner';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="bg-violet-50 flex justify-center py-6 px-4">
          <img
            src={item.image_url ?? '/assets/images/placeholder.png'}
            alt={item.name}
            className="h-40 w-40 object-contain"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-violet-900 mb-1">{item.name}</h2>
          {item.description && (
            <p className="text-sm text-gray-500 mb-4">{item.description}</p>
          )}
          <p className="text-2xl font-bold text-violet-700 mb-5">
            {Number(item.price)} THB
          </p>

          {/* Quantity stepper */}
          <div className="flex items-center justify-center gap-5 mb-6">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-900 font-bold text-lg flex items-center justify-center"
            >
              −
            </button>
            <span className="text-xl font-semibold w-8 text-center">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-9 h-9 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-900 font-bold text-lg flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* Subtotal + CTA */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-400">
              Subtotal:{" "}
              <span className="font-semibold text-violet-900">
                {Number(item.price) * qty} THB
              </span>
            </span>
            <button
              onClick={() => { onAdd(qty); onClose(); }}
              className="bg-violet-900 hover:bg-violet-800 text-white font-semibold px-6 py-2 rounded-xl"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.getAllProducts(100),
      productsApi.getCategories(),
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch(() => setError('Failed to load snacks.'))
      .finally(() => setLoading(false));
  }, []);

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { cart, addToCart } = context;

  // Total item count across all cart entries
  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  // Group products by category
  const grouped = [...categories]
    .sort((a, b) => a.display_order - b.display_order)
    .map((cat) => ({
      category: cat,
      items: products.filter((p) => p.category_id === cat.id),
    }));

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="flex justify-center py-20">
            <p className="text-xl text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && grouped.map(({ category, items }) => (
          <div key={category.id}>
            <h2 className="text-3xl font-bold text-violet-900 mb-5">
              {category.name}
            </h2>
            <div className="flex justify-center mb-16 bg-[url('/assets/background/bg_snackbar.png')] bg-cover rounded-xl shadow-lg p-10">
              <div className="flex flex-wrap justify-center items-center gap-8">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="m-4 p-4 rounded-4xl shadow-lg w-50 bg-white font-semibold text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  >
                    <img
                      src={item.image_url ?? '/assets/images/placeholder.png'}
                      alt={item.name}
                      className="w-full h-40 mb-4 rounded object-contain"
                    />
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-400 font-normal mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-violet-900 font-bold mt-3">{Number(item.price)} THB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      className="mt-3 bg-violet-900 hover:bg-violet-800 text-white rounded-xl px-4 h-8 text-sm w-full"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating cart button — only visible when cart has items */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed bottom-5 right-5 rounded-full bg-violet-900 hover:bg-violet-800 w-16 h-16 flex items-center justify-center z-50 shadow-lg transition-transform hover:scale-110"
          title={`Cart (${cartCount} item${cartCount !== 1 ? 's' : ''})`}
        >
          <img src="/assets/icons/cart_icon.png" alt="Cart" className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        </button>
      )}

      {/* Item modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(qty) => {
            // Add qty times (or extend CartContext to accept qty directly)
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
