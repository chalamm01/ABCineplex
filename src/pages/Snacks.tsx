import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

interface SnackItem {
  name: string;
  price: number;
  image: string;
  type: string;
}

const items: SnackItem[] = [
  {
    name: "Caramel Popcorn",
    price: 180,
    image: "/assets/images/caramel_popcorn.png",
    type: "snack",
  },
  {
    name: "Cheese Popcorn",
    price: 180,
    image: "/assets/images/cheese_popcorn.png",
    type: "snack",
  },
  {
    name: "Chocolate Popcorn",
    price: 180,
    image: "/assets/images/chocolate_popcorn.png",
    type: "snack",
  },
  {
    name: "Plain Popcorn",
    price: 180,
    image: "/assets/images/plain_popcorn.png",
    type: "snack",
  },
  { name: "Coke", price: 40, image: "/assets/images/coke.png", type: "beverage" },
  {
    name: "Coke Zero",
    price: 40,
    image: "/assets/images/coke_zero.png",
    type: "beverage",
  },
  { name: "Sprite", price: 40, image: "/assets/images/sprite.png", type: "beverage" },
  { name: "Fanta", price: 40, image: "/assets/images/fanta.png", type: "beverage" },
];

function Snacks() {
  const context = useContext(CartContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("CartContext must be used inside CartProvider");
  }

  const { addToCart } = context;

  // Group items by type dynamically
  const groupedByType = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<string, SnackItem[]>
  );

  // Format type name (capitalize first letter)
  const formatTypeName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-[url('/public/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        {Object.entries(groupedByType).map(([type, typeItems]) => (
          <div key={type}>
            <h2 className="text-3xl font-bold text-violet-900 mb-5">
              {formatTypeName(type)}
            </h2>
            <div className="flex justify-center mb-16 bg-[url('/public/assets/background/bg_snackbar.png')] bg-cover rounded-xl shadow-lg p-10">
              <div className="flex flex-wrap justify-center items-center gap-8">
                {typeItems.map((item) => (
                  <div
                    key={item.name}
                    className="m-4 p-4 rounded-4xl shadow-lg w-50 bg-white font-semibold text-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover mb-4 rounded"
                    />
                    {item.name}
                    <br />
                    <div className="grid grid-cols-2 gap-5 text-violet-900 mt-2 items-center mx-auto">
                      {item.price} THB
                      <button
                        onClick={() => addToCart(item)}
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
