import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationPanel from '../components/NotificationPanel';
import { useState } from 'react';

const MainLayout = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleNotifications={toggleNotifications} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        
        {showNotifications && (
          <NotificationPanel 
            onClose={() => setShowNotifications(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default MainLayout; 