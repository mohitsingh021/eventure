import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc, 
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../firebase/config';
import { ref as databaseRef, push, set, onValue, off } from 'firebase/database';
import { ChatRoom, ChatMessage } from '../types';

/**
 * Creates a new chat room or returns an existing one if it already exists with the same participants
 */
export const createChatRoom = async (userId1: string, userId2: string): Promise<ChatRoom> => {
  try {
    // Check if a chat room already exists with these participants
    const participants = [userId1, userId2].sort();
    const existingRoom = await findExistingChatRoom(participants);
    
    if (existingRoom) {
      return existingRoom;
    }
    
    // Create a new chat room
    const chatRoomRef = await addDoc(collection(firestore, 'chatRooms'), {
      participants,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTimestamp: serverTimestamp(),
    });
    
    return {
      id: chatRoomRef.id,
      participants,
      createdAt: new Date(),
      lastMessage: undefined,
      unreadCount: 0
    };
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

/**
 * Finds an existing chat room with the exact set of participants
 */
export const findExistingChatRoom = async (participants: string[]): Promise<ChatRoom | null> => {
  try {
    // Sort participants for consistent order
    const sortedParticipants = [...participants].sort();
    
    // Query for chat rooms that contain all participants
    const chatRoomQuery = query(
      collection(firestore, 'chatRooms'),
      where('participants', 'array-contains', sortedParticipants[0])
    );
    
    const snapshot = await getDocs(chatRoomQuery);
    
    // Find a room that has exactly the same participants
    for (const roomDoc of snapshot.docs) {
      const roomData = roomDoc.data();
      const roomParticipants = [...roomData.participants].sort();
      
      if (roomParticipants.length === sortedParticipants.length && 
          roomParticipants.every((participant, index) => participant === sortedParticipants[index])) {
        return {
          id: roomDoc.id,
          participants: roomData.participants,
          lastMessage: roomData.lastMessage,
          createdAt: roomData.createdAt?.toDate() || new Date(),
          unreadCount: roomData.unreadCount || 0
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding existing chat room:', error);
    throw error;
  }
};

/**
 * Gets a chat room by ID
 */
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const roomDoc = await getDoc(doc(firestore, 'chatRooms', roomId));
    
    if (!roomDoc.exists()) {
      return null;
    }
    
    const data = roomDoc.data();
    return {
      id: roomDoc.id,
      participants: data.participants,
      lastMessage: data.lastMessage,
      createdAt: data.createdAt?.toDate() || new Date(),
      unreadCount: data.unreadCount || 0
    };
  } catch (error) {
    console.error('Error getting chat room:', error);
    throw error;
  }
};

/**
 * Gets all chat rooms that a user is part of
 */
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const roomsQuery = query(
      collection(firestore, 'chatRooms'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    
    const snapshot = await getDocs(roomsQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage,
        createdAt: data.createdAt?.toDate() || new Date(),
        unreadCount: data.unreadCount || 0
      };
    });
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a user's chat rooms
 */
export const listenToUserChatRooms = (
  userId: string, 
  callback: (rooms: ChatRoom[]) => void
): Unsubscribe => {
  try {
    const roomsQuery = query(
      collection(firestore, 'chatRooms'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    
    return onSnapshot(roomsQuery, (snapshot) => {
      const rooms = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          createdAt: data.createdAt?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0
        };
      });
      callback(rooms);
    });
  } catch (error) {
    console.error('Error setting up chat rooms listener:', error);
    throw error;
  }
};

/**
 * Sends a message to a chat room
 */
export const sendMessage = async (
  roomId: string, 
  messageData: Omit<ChatMessage, 'id'>
): Promise<string> => {
  try {
    // Add the message
    const messageRef = await addDoc(collection(firestore, 'chatRooms', roomId, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp()
    });
    
    // Update the chat room with the last message
    await updateDoc(doc(firestore, 'chatRooms', roomId), {
      lastMessage: {
        text: messageData.text,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        timestamp: serverTimestamp()
      },
      lastMessageTimestamp: serverTimestamp()
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Gets all messages in a chat room
 */
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const messagesQuery = query(
      collection(firestore, 'chatRooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read || false
      };
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for messages in a chat room
 */
export const listenToChatMessages = (
  roomId: string, 
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  try {
    const messagesQuery = query(
      collection(firestore, 'chatRooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false
        };
      });
      callback(messages);
    });
  } catch (error) {
    console.error('Error setting up messages listener:', error);
    throw error;
  }
};

/**
 * Marks messages as read
 */
export const markMessagesAsRead = async (roomId: string, messageIds: string[]): Promise<void> => {
  if (messageIds.length === 0) return;
  
  try {
    const batch = writeBatch(firestore);
    
    messageIds.forEach(messageId => {
      const messageRef = doc(firestore, 'chatRooms', roomId, 'messages', messageId);
      batch.update(messageRef, { read: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}; 