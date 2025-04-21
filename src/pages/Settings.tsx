import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError('');
      await logout();
    } catch (error) {
      setError('Failed to log out');
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Email: {currentUser?.email}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">
                  Account created: {currentUser?.metadata.creationTime}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Preferences settings will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 