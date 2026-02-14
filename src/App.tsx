import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Navbar from "./components/Navbar.tsx";
import Register from "./pages/Register.tsx";
import Snacks from "./pages/Snacks.tsx";
import Cart from "./pages/Cart.tsx";

function App() {
  return (
    <>
      <div className="static">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/snacks" element={<Snacks />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        <div className="absolute top-0 w-full">
          <Navbar />
        </div>
      </div>
    </>
  );
}

export default App;
