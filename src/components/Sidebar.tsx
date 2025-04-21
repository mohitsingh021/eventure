import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4 py-4">
          <div className="text-center">
            <img
              className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-indigo-600"
              src={userProfile?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.displayName || 'User')}
              alt={userProfile?.displayName || 'User'}
            />
            <h2 className="mt-2 text-xl font-medium text-gray-900">{userProfile?.displayName}</h2>
            <p className="text-sm text-gray-500">
              {userProfile?.role === 'organizer' ? 'Event Organizer' : 'Sponsor'}
            </p>
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md 
                  ${isActive
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 flex-shrink-0 h-6 w-6 
                    ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 