import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Navbar from "./components/Navbar.tsx";
import Register from "./pages/Register.tsx";
import Snacks from "./pages/Snacks.tsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/snacks" element={<Snacks />} />
      </Routes>
    </>
  );
}

export default App;
