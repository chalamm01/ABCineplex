

import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { cart } = context;

  return (
    <div className="static bg-[url('/public/assets/background/bg_snackpage.png')] bg-cover min-h-screen min-w-screen">
        <div className="bg-white/70 backdrop-blur-xs pb-20 absolute inset-0 pt-16">
            {cart.map((item, index) => (
            <div className="flex flex-row bg-white/70 rounded-lg shadow-lg p-4 m-6" key={index}>
                <div className="item-center">
                    <img src={item.image} alt={item.name} className="ml-4" />
                </div>

            
            </div>
      ))}
        </div>
    </div>

  );
}

export default Cart;