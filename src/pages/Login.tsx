import { Link } from "react-router-dom";


function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/src/assets/bg.png')] bg-cover bg-center">
        <div className="flex min-h-screen min-w-screen items-center justify-center bg-white/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white bg-white p-8 rounded-xl shadow-lg">
            <h2 className="mb-6 text-center text-2xl font-semibold text-black">
              Welcome back
            </h2>
            <label htmlFor="email" className="font-semibold block text-left">Email</label>
            <input className="mb-4 w-full rounded-lg px-4 py-2 border border-gray-300" placeholder="Email" />
            <label htmlFor="password" className="font-semibold block text-left">Password</label>
            <input className="mb-6 w-full rounded-lg px-4 py-2 border border-gray-300" placeholder="Password" type="password" />

            <button className="w-full rounded-lg bg-black py-2 text-white font-semibold">
              Login
            </button>
            <label className="font-semibold">Don't have an account? </label>
            <Link to="/register" className="underline text-black font-semibold">Sign up</Link>
          </div>
        </div>
    </div>

  );
}

export default Login;