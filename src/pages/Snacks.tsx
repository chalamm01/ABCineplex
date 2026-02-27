import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/providers/CartContextDef";
import { useNavigate } from "react-router-dom";
import { productsApi } from "@/services/api";
import type { Product, Category } from "@/services/api";
import { Spinner } from '@/components/ui/spinner'

function Snacks() {
  const context = useContext(CartContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.getProducts(0, 100),
      productsApi.getCategories(),
    ])
      .then(([prods, cats]) => {
        setProducts(prods); // Show all products, ignore in_stock filter for debugging
        setCategories(cats);
      })
      .catch(() => setError('Failed to load snacks.'))
      .finally(() => setLoading(false));
  }, []);

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { addToCart } = context;

  // Group products by category
  const grouped = categories
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
            <Spinner/>
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
                    className="m-4 p-4 rounded-4xl shadow-lg w-50 bg-white font-semibold text-center"
                  >
                    <img
                      src={item.image_url ?? '/assets/images/placeholder.png'}
                      alt={item.name}
                      className="w-full h-40 object-contain mb-4 rounded"
                    />
                    {item.name}
                    {item.description && (
                      <p className="text-xs text-gray-400 font-normal mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <br />
                    <div className="grid grid-cols-2 gap-5 text-violet-900 mt-2 items-center mx-auto">
                      {Number(item.price)} THB
                      <button
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: Number(item.price),
                            image: item.image_url ?? '/assets/images/placeholder.png',
                          })
                        }
                        className="bg-violet-900 hover:bg-violet-900/70 text-white rounded-xl w-12 h-7 mx-auto"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-5 right-5 rounded-full bg-black/75 w-16 h-16 flex items-center justify-center z-50"
      >
        <img src="./assets/icons/cart_icon.png" alt="" />
      </button>
    </div>
  );
}

export default Snacks;
