import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getUserChatRooms, listenToUserChatRooms } from '../services/chat.service';
import { getUserProfile } from '../services/profile.service';
import { ChatRoom } from '../types';

const Chat = () => {
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Store participant display information
  const [participantInfo, setParticipantInfo] = useState<Record<string, { displayName: string; photoURL: string }>>({});
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Set up real-time chat rooms listener
    const unsubscribe = listenToUserChatRooms(currentUser.uid, (rooms) => {
      setChatRooms(rooms);
      setLoading(false);
      
      // Load participant info for all rooms
      rooms.forEach(room => {
        const otherParticipantId = room.participants.find(id => id !== currentUser.uid);
        if (otherParticipantId && !participantInfo[otherParticipantId]) {
          loadParticipantInfo(otherParticipantId);
        }
      });
    });
    
    // Clean up listener
    return () => unsubscribe();
  }, [currentUser]);
  
  const loadParticipantInfo = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId);
      
      setParticipantInfo(prev => ({
        ...prev,
        [userId]: {
          displayName: userProfile.displayName,
          photoURL: userProfile.photoURL || ''
        }
      }));
    } catch (error) {
      console.error(`Error loading participant info for ${userId}:`, error);
    }
  };
  
  const renderChatRoomItem = (room: ChatRoom) => {
    if (!currentUser) return null;
    
    // Find the other participant
    const otherParticipantId = room.participants.find(id => id !== currentUser.uid);
    if (!otherParticipantId) return null;
    
    const participantData = participantInfo[otherParticipantId];
    
    return (
      <Link
        to={`/chat/${room.id}`}
        key={room.id}
        className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50"
      >
        <div className="flex-shrink-0">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={participantData?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(participantData?.displayName || 'User')}
            alt={participantData?.displayName || 'User'}
          />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {participantData?.displayName || 'Loading...'}
            </h3>
            {room.lastMessage?.timestamp && (
              <p className="text-xs text-gray-500">
                {format(new Date(room.lastMessage.timestamp.toDate()), 'MMM d, h:mm a')}
              </p>
            )}
          </div>
          {room.lastMessage && (
            <p className="mt-1 text-sm text-gray-600 truncate">
              {room.lastMessage.senderId === currentUser.uid ? 'You: ' : ''}
              {room.lastMessage.text}
            </p>
          )}
        </div>
      </Link>
    );
  };
  
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p>Please log in to view your chats</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading chats...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Visit profiles and start a chat with organizers or sponsors
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chatRooms.map(renderChatRoomItem)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 