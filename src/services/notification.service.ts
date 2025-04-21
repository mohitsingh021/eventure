import { 
  collection, 
  doc,
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Unsubscribe,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { Notification } from '../types';

// Get user notifications
export const getUserNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(firestore, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(firestore, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Listen to notifications in real-time
export const listenToNotifications = (
  userId: string, 
  callback: (notifications: Notification[]) => void
): Unsubscribe => {
  const notificationsRef = collection(firestore, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    
    callback(notifications);
  });
};

// Create a notification (use sparingly; usually created in response to other actions)
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  try {
    const notificationData = {
      ...notification,
      createdAt: serverTimestamp()
    };
    
    const notificationRef = await addDoc(collection(firestore, 'notifications'), notificationData);
    
    return {
      id: notificationRef.id,
      ...notificationData,
      createdAt: new Date()
    } as Notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}; 