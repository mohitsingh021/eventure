import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  listenToNotifications
} from '../services/notification.service';
import { Notification } from '../types';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Set up real-time notifications listener
    const unsubscribe = listenToNotifications(currentUser.uid, (latestNotifications) => {
      setNotifications(latestNotifications);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);
  
  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await markAllNotificationsAsRead(currentUser.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Get the notification target URL based on type
  const getNotificationUrl = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        // Link to the post
        return `/`;
      case 'message':
        // Link to the chat room
        return `/chat`;
      default:
        return '/';
    }
  };
  
  // Get notification message based on type
  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.sourceUserName} liked your post`;
      case 'comment':
        return `${notification.sourceUserName} commented on your post`;
      case 'message':
        return `${notification.sourceUserName} sent you a message`;
      default:
        return 'You have a new notification';
    }
  };
  
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Notifications</h3>
        <div className="flex space-x-4">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications to display
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
            >
              <Link
                to={getNotificationUrl(notification)}
                onClick={() => handleMarkAsRead(notification.id)}
                className="block"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={notification.sourceUserPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(notification.sourceUserName)}
                      alt={notification.sourceUserName}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.createdAt && format(new Date(notification.createdAt.toDate()), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Delete</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel; 