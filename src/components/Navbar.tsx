import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const navitems = [
  { icon: "/public/assets/icons/home_icon.svg", name: "HOME", path: "/" },
  {
    icon: "/public/assets/icons/movies_icon.svg",
    name: "MOVIES",
    path: "/movies",
  },
  {
    icon: "/public/assets/icons/watchlists_icon.svg",
    name: "WATCHLISTS",
    path: "/watchlists",
  },
  {
    icon: "/public/assets/icons/snacks_icon.svg",
    name: "SNACKS",
    path: "/snacks",
  },
  {
    icon: "/public/assets/icons/community_icon.svg",
    name: "COMMUNITY",
    path: "/community",
  },
  {
    icon: "/public/assets/icons/rewards_icon.svg",
    name: "REWARDS",
    path: "/rewards",
  },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="bg-white shadow">
        <div className="flex justify-center items-center h-16">
          {/* Left */}
          <Link
            to="/"
            className="flex items-center mr-auto p-4 font-bold text-xl"
          >
            <img
              src="/public/assets/icons/abc_logo.png"
              alt="Logo"
              className="h-[48px]"
            />
          </Link>

          {/* Center */}
          <div className="flex justify-center gap-4 md:gap-8 lg:gap-12 mx-auto">
            {navitems.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                className={({ isActive }) =>
                  isActive
                    ? "text-black font-medium"
                    : "text-gray-600 hover:text-gray-400 font-semibold"
                }
              >
                <img
                  src={item.icon}
                  alt=""
                  className="inline mb-1 opacity-70 mr-1"
                />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* <div className="flex justify-center gap-4 md:gap-8 lg:gap-12 mx-auto">
            <a className="text-gray-600 hover:text-gray-400">HOME</a>
            <a className="text-gray-600 hover:text-gray-400">MOVIES</a>
            <a className="text-gray-600 hover:text-gray-400">WATCHLISTS</a>
            <a className="text-gray-600 hover:text-gray-400">SNACKS</a>
            <a className="text-gray-600 hover:text-gray-400">COMMUNITY</a>
            <a className="text-gray-600 hover:text-gray-400">REWARDS</a>
          </div> */}

          {/* Right */}
          <button onClick={() => setOpen(!open)} className="ml-auto p-4">
            <img
              src="/public/assets/icons/avatar.svg"
              alt="Profile"
              className="h-6 hover:opacity-50"
            />
          </button>
        </div>
      </nav>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 mr-2">
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-black border-b border-neutral-100 last:border-b-0 rounded-lg"
          >
            SignIn
          </button>
        </div>
      )}
    </>
  );
}
export default Navbar;
