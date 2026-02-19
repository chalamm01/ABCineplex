import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Navbar from "./components/Navbar.tsx";
import Register from "./pages/Register.tsx";
import Snacks from "./pages/Snacks.tsx";
import Cart from "./pages/Cart.tsx";
import Movies from "./pages/Movies.tsx";
import LandingPage from "./pages/LandingPage.tsx";
function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/snacks" element={<Snacks />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/movies" element={<Movies />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
