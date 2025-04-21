import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadNotificationsCount } from '../services/notification.service';

interface NavbarProps {
  toggleNotifications: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleNotifications }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Only fetch unread count if user is logged in
    if (currentUser) {
      const fetchUnreadCount = async () => {
        try {
          const count = await getUnreadNotificationsCount(currentUser.uid);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      };
      
      fetchUnreadCount();
      
      // Could set up a listener for real-time updates here
      const intervalId = setInterval(fetchUnreadCount, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [currentUser]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Eventure</span>
            </Link>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <form onSubmit={handleSearch} className="max-w-lg w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search for events, sponsors, or organizers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={toggleNotifications}
              className="ml-4 p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <div className="ml-4 relative flex-shrink-0">
              <div className="flex items-center">
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={userProfile?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.displayName || 'User')}
                    alt={userProfile?.displayName || 'User'}
                  />
                  <span className="ml-2 hidden md:block">{userProfile?.displayName}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 