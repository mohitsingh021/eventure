import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchUsers } from '../services/profile.service';
import { User, UserRole } from '../types';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  
  // Parse query from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    const role = queryParams.get('role') as UserRole | '' || '';
    
    setSearchQuery(query);
    setRoleFilter(role);
    
    if (query) {
      performSearch(query, role);
    }
  }, [location.search]);
  
  const performSearch = async (query: string, role: UserRole | '') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const results = await searchUsers(query, role ? { role } : {});
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (roleFilter) params.append('role', roleFilter);
    
    navigate({ pathname: '/search', search: params.toString() });
    
    performSearch(searchQuery, roleFilter);
  };
  
  const clearFilters = () => {
    setRoleFilter('');
    
    // Update URL to remove role filter
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    
    navigate({ pathname: '/search', search: params.toString() });
    
    // Re-run search without role filter
    performSearch(searchQuery, '');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search for events, sponsors, or organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>
      </div>
      
      <div className="mb-6 flex items-center space-x-2">
        <div className="text-sm font-medium text-gray-700 flex items-center">
          <FunnelIcon className="h-4 w-4 mr-1" />
          <span>Filters:</span>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setRoleFilter('organizer');
              // Update URL
              const params = new URLSearchParams(location.search);
              params.set('role', 'organizer');
              navigate({ pathname: '/search', search: params.toString() });
              // Re-run search
              performSearch(searchQuery, 'organizer');
            }}
            className={`px-3 py-1 text-sm rounded-full ${
              roleFilter === 'organizer'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Organizers
          </button>
          
          <button
            type="button"
            onClick={() => {
              setRoleFilter('sponsor');
              // Update URL
              const params = new URLSearchParams(location.search);
              params.set('role', 'sponsor');
              navigate({ pathname: '/search', search: params.toString() });
              // Re-run search
              performSearch(searchQuery, 'sponsor');
            }}
            className={`px-3 py-1 text-sm rounded-full ${
              roleFilter === 'sponsor'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Sponsors
          </button>
          
          {roleFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 hover:bg-red-200 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Searching...</p>
        </div>
      ) : searchQuery && searchResults.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No results found for "{searchQuery}"</p>
          {roleFilter && (
            <p className="text-sm text-gray-400 mt-1">
              Try removing filters or using different search terms
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((user) => (
            <Link
              to={`/profile/${user.uid}`}
              key={user.uid}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                {user.coverImageURL && (
                  <img
                    src={user.coverImageURL}
                    alt="Cover"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                )}
              </div>
              
              <div className="p-4 pt-0">
                <div className="flex items-end -mt-10">
                  <img
                    src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName)}
                    alt={user.displayName}
                    className="h-16 w-16 rounded-full border-4 border-white object-cover"
                  />
                  
                  <div className="ml-4 mt-10">
                    <h3 className="text-lg font-medium text-gray-900">{user.displayName}</h3>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {user.about || 'No description provided'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search; 