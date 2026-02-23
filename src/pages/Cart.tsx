import { useContext } from "react";
import { CartContext } from "../context/CartContextDef";

function Cart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = context;

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
      <div className="relative flex gap-16">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">YOUR CART</h1>

          {cart.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center justify-between bg-white rounded-xl shadow-md p-6 mb-6"
            >
              <div className="flex items-center gap-6 size-20">
                <img src={item.image} className="w-20" />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decreaseQuantity(item.name)}
                  className="bg-violet-900 hover:bg-violet-900/70 text-white w-6 h-6 rounded-full item-center"
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => increaseQuantity(item.name)}
                  className="bg-violet-900 hover:bg-violet-900/70 text-white w-6 h-6 rounded-full item-center"
                >
                  +
                </button>
              </div>

              {/* Price */}
              <div className="text-violet-900 font-semibold">
                {item.price * (item.quantity || 1)} THB
              </div>

              <button
                onClick={() => {
                  removeFromCart(i);
                }}
                className="bg-red-700 hover:bg-red-700/70 px-4 py-2 rounded-lg text-white "
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className="w-80 bg-white p-6 shadow-md rounded-lg h-fit mt-17">
          <h2 className="text-xl font-bold mb-6">SUMMARY</h2>

          {cart.map((item) => (
            <div key={item.name} className="flex justify-between mb-4">
              <div>
                {item.name}
                <br />
                {item.price} x {item.quantity}
              </div>
              <div className="text-purple-700">
                {item.price * (item.quantity || 1)}
              </div>
            </div>
          ))}

          <hr className="my-4" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{total} THB</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Cart;
