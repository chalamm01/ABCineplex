import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Navbar from "./components/Navbar.tsx";
import Register from "./pages/Register.tsx";
import Snacks from "./pages/Snacks.tsx";
import Cart from "./pages/Cart.tsx";
import Movies from "./pages/Movies.tsx";
import MovieBooking from "./pages/MovieBooking.tsx";
import Payment from "./pages/Payment.tsx";
import Home from "./pages/Home.tsx";
import Admin from "./pages/Admin.tsx";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/homepage" element={<Home/>}/>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/auth/callback" element={<AuthCallback/>} />
          <Route path="/snacks" element={<Snacks/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/movies" element={<Movies/>} />
          <Route path="/movie/:id" element={<MovieBooking/>} />
          <Route path="/payment" element={<Payment/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
