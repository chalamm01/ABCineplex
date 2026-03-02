import { useContext, useState } from "react";
import { CartContext } from "@/providers/CartContextDef";
import { ordersApi } from "@/services/api";
import type { OrderResponse } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

function Cart() {
  const context = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [orderError, setOrderError] = useState('');

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = context;

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  const pointsToEarn = Math.max(1, Math.floor(total / 10));

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;

    const items = cart
      .filter((item) => item.id)
      .map((item) => ({ product_id: item.id as string, quantity: item.quantity || 1 }));

    if (items.length === 0) {
      setOrderError('Some items are missing product IDs. Please re-add them.');
      return;
    }

    setOrdering(true);
    setOrderError('');
    try {
      const result = await ordersApi.createOrder(items);
      setOrderResult(result);
      clearCart();
    } catch {
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (orderResult) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white/70 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🍿</div>
            <h1 className="text-2xl font-bold text-violet-900 mb-2">Order Placed!</h1>
            <p className="text-gray-500 mb-4">
              Your snacks are being prepared. Pick them up at the counter before the show.
            </p>

            <div className="bg-violet-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-mono text-xs text-gray-700 truncate">{orderResult.id}</p>
              <hr className="my-3" />
              {orderResult.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">×{item.quantity}</span>
                  <span className="font-medium text-violet-900">{Number(item.subtotal)} THB</span>
                </div>
              ))}
              <hr className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-violet-900">{Number(orderResult.total_amount)} THB</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm text-green-700 font-medium">
              🎉 +{pointsToEarn} loyalty points earned from this order!
            </div>

            <button
              onClick={() => navigate('/movies')}
              className="w-full bg-violet-900 hover:bg-violet-800 text-white font-semibold py-3 rounded-xl"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main cart ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <div className="relative flex gap-16">
          {/* LEFT SIDE */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-8">YOUR CART</h1>

            {cart.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-xl mb-4">Your cart is empty</p>
                <button
                  onClick={() => navigate('/snacks')}
                  className="bg-violet-900 hover:bg-violet-800 text-white px-6 py-2 rounded-xl"
                >
                  Browse Snacks
                </button>
              </div>
            )}

            {cart.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between bg-white rounded-xl shadow-md p-6 mb-6"
              >
                <div className="flex items-center gap-6 size-20">
                  <img src={item.image} alt={item.name} className="w-20" />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.name)}
                    className="bg-violet-900 hover:bg-violet-900/70 text-white w-6 h-6 rounded-full"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.name)}
                    className="bg-violet-900 hover:bg-violet-900/70 text-white w-6 h-6 rounded-full"
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <div className="text-violet-900 font-semibold">
                  {item.price * (item.quantity || 1)} THB
                </div>

                <button
                  onClick={() => removeFromCart(i)}
                  className="bg-red-700 hover:bg-red-700/70 px-4 py-2 rounded-lg text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          {cart.length > 0 && (
            <div className="w-80 bg-white p-6 shadow-md rounded-lg h-fit mt-17">
              <h2 className="text-xl font-bold mb-6">SUMMARY</h2>

              {cart.map((item) => (
                <div key={item.name} className="flex justify-between mb-4">
                  <div>
                    {item.name}
                    <br />
                    <span className="text-sm text-gray-500">{item.price} × {item.quantity}</span>
                  </div>
                  <div className="text-purple-700">
                    {item.price * (item.quantity || 1)}
                  </div>
                </div>
              ))}

              <hr className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-2">
                <span>Total</span>
                <span>{total} THB</span>
              </div>

              <p className="text-xs text-green-600 text-right mb-4">
                🎉 Earn ~{pointsToEarn} loyalty points
              </p>

              {orderError && (
                <p className="text-sm text-red-500 mb-3">{orderError}</p>
              )}

              {!user && (
                <p className="text-sm text-amber-600 mb-3">
                  Please <button onClick={() => navigate('/login')} className="underline font-medium">log in</button> to place an order.
                </p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={ordering || cart.length === 0}
                className="w-full bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {ordering ? <><Spinner /><span>Placing Order…</span></> : 'Place Order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
