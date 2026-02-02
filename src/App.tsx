import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login.tsx';
import Navbar from './components/Navbar.tsx';
import Register from './pages/register.tsx';

function App() {


  return (
    <>
      <div className='Login'>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
