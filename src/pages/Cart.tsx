import { useContext } from "react";
import { CartContext } from "@/providers/CartContextDef";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const context = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = context;

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  const pointsToEarn = Math.max(1, Math.floor(total / 10));

  const handleProceedToPayment = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;
    navigate('/payment', { state: { cart, total } });
  };

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

              {!user && (
                <p className="text-sm text-amber-600 mb-3">
                  Please <button onClick={() => navigate('/login')} className="underline font-medium">log in</button> to place an order.
                </p>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={cart.length === 0}
                className="w-full bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
