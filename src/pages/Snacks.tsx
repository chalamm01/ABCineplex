import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const snacks = [
  {
    name: "Caramel Popcorn",
    price: 180,
    image: "/assets/images/caramel_popcorn.png",
  },
  {
    name: "Cheese Popcorn",
    price: 180,
    image: "/assets/images/cheese_popcorn.png",
  },
  {
    name: "Chocolate Popcorn",
    price: 180,
    image: "/assets/images/chocolate_popcorn.png",
  },
  {
    name: "Plain Popcorn",
    price: 180,
    image: "/assets/images/plain_popcorn.png",
  },
];

const beverages = [
  { name: "Coke", price: 40, image: "/assets/images/coke.png" },

  { name: "Coke Zero", price: 40, image: "/assets/images/coke_zero.png" },

  { name: "Sprite", price: 40, image: "/assets/images/sprite.png" },

  { name: "Fanta", price: 40, image: "/assets/images/fanta.png" },
];

function Snacks() {
  const context = useContext(CartContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { addToCart } = context;

  return (
    <div className="min-h-screen bg-[url('/assets/background/bg_snackpage.png')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-white/70 backdrop-blur-xs pt-16">
        <h2 className="text-3xl font-bold text-violet-900 block mt-8 ml-40">
          Popcorn
        </h2>
        {/*SnacksBar*/}
        <div className="flex justify-center mt-10 bg-[url('/public/assets/background/bg_snackbar.png')] bg-cover mx-40 rounded-xl shadow-lg h-96">
          <div className="flex justify-center items-center gap-8 mt-10 mb-10">
            {snacks.map((snack) => (
              <div
                key={snack.name}
                className="m-4 p-4 rounded-4xl shadow-lg w-50 bg-white font-semibold text-center"
              >
                <img
                  src={snack.image}
                  alt={snack.name}
                  className="w-full h-40 object-cover mb-4 rounded"
                />
                {snack.name}
                <br />
                <div className="text-violet-900 mt-2">
                  {snack.price} THB
                  <button
                    onClick={() => addToCart(snack)}
                    className="ml-14 bg-violet-900 hover:bg-violet-900/70 text-white  rounded-xl w-12 h-7"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-violet-900 block mt-8 ml-40">
          Beverages
        </h2>
        {/*beverages*/}
        <div className="flex justify-center mt-10 bg-[url('/public/assets/background/bg_snackbar.png')] bg-cover mx-40 rounded-xl shadow-lg h-96">
          <div className="flex justify-center items-center gap-8 mt-10 mb-10">
            {beverages.map((beverag) => (
              <div
                key={beverag.name}
                className="m-4 p-4 rounded-4xl shadow-lg w-50 bg-white font-semibold text-center"
              >
                <img
                  src={beverag.image}
                  alt={beverag.name}
                  className="h-40 object-cover mb-4 rounded mx-auto"
                />
                {beverag.name}
                <br />
                <div className="text-violet-900 mt-2">
                  {beverag.price} THB
                  <button
                    onClick={() => addToCart(beverag)}
                    className="ml-14 bg-violet-900 hover:bg-violet-900/70 text-white rounded-xl w-12 h-7"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
