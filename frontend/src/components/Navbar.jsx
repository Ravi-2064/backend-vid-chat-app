import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaHome, FaComments, FaVideo, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Streamify
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
            >
              <FaHome className="mr-2" />
              <span>Home</span>
            </Link>
            <Link 
              to="/chat" 
              className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
            >
              <FaComments className="mr-2" />
              <span>Chat</span>
            </Link>
            <Link 
              to="/video-chat" 
              className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
            >
              <FaVideo className="mr-2" />
              <span>Video Chat</span>
            </Link>
            <Link 
              to="/friends" 
              className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
            >
              <FaUserFriends className="mr-2" />
              <span>Friends</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              onClick={() => setHasNotifications(false)}
            >
              <FaBell size={20} />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  !
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 text-gray-600 hover:text-purple-600 transition-all duration-200"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src={user.avatar || 'https://via.placeholder.com/32'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-100 hover:border-purple-300 transition-all duration-200"
                />
                <span className="hidden md:block font-medium">{user.name}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    <FaUser className="mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
                  >
                    <FaCog className="mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
