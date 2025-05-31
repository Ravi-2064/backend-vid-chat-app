import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation } = useLogout();

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-50 border-b border-blue-100">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ShipWheelIcon className="size-8 text-blue-600" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Streamify
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6">
            <NavLink to="/" label="Home" active={location.pathname === '/'} />
            {authUser && (
              <>
                <NavLink to="/chat" label="Chat Room" active={location.pathname === '/chat'} />
                <NavLink to="/friends" label="Friends" active={location.pathname === '/friends'} />
                <NavLink to="/notifications" label="Notifications" active={location.pathname === '/notifications'} />
              </>
            )}
            {!authUser && (
              <>
                <NavLink to="/login" label="Login" active={location.pathname === '/login'} />
                <NavLink to="/register" label="Register" active={location.pathname === '/register'} />
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {authUser && (
              <button
                onClick={() => logoutMutation()}
                className="btn btn-ghost btn-sm text-error hover:bg-error/10 transition-colors"
                aria-label="Logout"
              >
                <LogOutIcon className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, label, active }) => (
  <Link
    to={to}
    className={`text-base font-medium px-4 py-2 rounded-lg transition-all ${
      active 
        ? 'bg-blue-100 text-blue-700 shadow-sm' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
