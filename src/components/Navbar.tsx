function Navbar() {
  return (
    <nav className="bg-white shadow">

        <div className="grid grid-cols-3 items-center h-16">
          
          {/* Left */}
          <div className="text-xl font-bold text-black mr-auto p-4">
            AppLogo
          </div>

          {/* Center */}
          <div className="flex justify-center gap-4 md:gap-8 lg:gap-12 mx-auto">
            <a className="text-gray-600 hover:text-gray-400">HOME</a>
            <a className="text-gray-600 hover:text-gray-400">MOVIES</a>
            <a className="text-gray-600 hover:text-gray-400">WATCHLISTS</a>
            <a className="text-gray-600 hover:text-gray-400">SNACKS</a>
            <a className="text-gray-600 hover:text-gray-400">COMMUNITY</a>
            <a className="text-gray-600 hover:text-gray-400">REWARDS</a>
          </div>

          {/* Right */}
          <div className="text-black ml-auto p-4 font-semibold">
            PFP
          </div>

        </div>

    </nav>
  );
}
export default Navbar;