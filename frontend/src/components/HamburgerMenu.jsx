import { useState } from 'react';
import { Menu, X, User, Settings, BookOpen, List, MessageSquare, Users, Activity, Image, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: 'Profile',
      icon: <User className="size-5" />,
      link: '/dashboard',
      badge: null
    },
    {
      title: 'Activity',
      icon: <Activity className="size-5" />,
      link: '/dashboard#activity',
      badge: null
    },
    {
      title: 'Friends',
      icon: <Users className="size-5" />,
      link: '/friends',
      badge: user?.friendsCount || 0
    },
    {
      title: 'Messages',
      icon: <MessageSquare className="size-5" />,
      link: '/messages',
      badge: user?.messagesCount || 0
    },
    {
      title: 'Blogs',
      icon: <BookOpen className="size-5" />,
      link: '#',
      onClick: () => document.getElementById('blog-section')?.scrollIntoView({ behavior: 'smooth' }),
      badge: user?.blogs?.length || 0
    },
    {
      title: 'Hobbies',
      icon: <List className="size-5" />,
      link: '#',
      onClick: () => document.getElementById('hobbies-section')?.scrollIntoView({ behavior: 'smooth' }),
      badge: user?.hobbies?.length || 0
    },
    {
      title: 'Background',
      icon: <Image className="size-5" />,
      link: '#',
      onClick: () => document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' }),
      badge: null
    },
    {
      title: 'Settings',
      icon: <Settings className="size-5" />,
      link: '#',
      onClick: () => document.getElementById('settings-section')?.scrollIntoView({ behavior: 'smooth' }),
      badge: null
    }
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 btn btn-circle btn-ghost"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-base-100 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* User Profile Section */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img src={user?.profilePic} alt={user?.fullName} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{user?.fullName}</h3>
              <p className="text-sm opacity-70">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              className="w-full"
            >
              <Link
                to={item.link}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                {item.badge !== null && (
                  <span className="badge badge-primary badge-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300">
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors w-full text-error"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu; 