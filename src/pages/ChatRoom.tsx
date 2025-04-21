import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getChatRoom, 
  getChatMessages, 
  listenToChatMessages, 
  sendMessage, 
  markMessagesAsRead 
} from '../services/chat.service';
import { getUserProfile } from '../services/profile.service';
import { ChatRoom as ChatRoomType, ChatMessage } from '../types';
import Chat from '../components/Chat/Chat';
import { Message } from '../components/Chat/ChatList';
import { v4 as uuidv4 } from 'uuid';

const ChatRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();
  
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId || !currentUser) return;

    const fetchChatRoomData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get chat room details
        const room = await getChatRoom(roomId);
        setChatRoom(room);
        
        if (room) {
          // Get other participant's info
          const otherParticipantId = room.participants.find(id => id !== currentUser.uid);
          if (otherParticipantId) {
            const userProfile = await getUserProfile(otherParticipantId);
            setOtherUser({
              id: otherParticipantId,
              name: userProfile.displayName,
              avatar: userProfile.photoURL
            });
          }
          
          // Get chat messages
          const chatMessages = await getChatMessages(roomId);
          
          // Convert to Message format for our Chat component
          const formattedMessages = await Promise.all(chatMessages.map(async (msg) => {
            let senderProfile;
            
            if (msg.senderId === currentUser.uid) {
              senderProfile = {
                id: currentUser.uid,
                name: currentUser.displayName || 'You',
                avatar: currentUser.photoURL || undefined
              };
            } else if (otherParticipantId) {
              const profile = await getUserProfile(msg.senderId);
              senderProfile = {
                id: msg.senderId,
                name: profile.displayName,
                avatar: profile.photoURL
              };
            } else {
              senderProfile = {
                id: msg.senderId,
                name: 'Unknown User',
                avatar: undefined
              };
            }
            
            return {
              id: msg.id,
              text: msg.text,
              sender: senderProfile,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
            };
          }));
          
          setMessages(formattedMessages);
          
          // Mark unread messages as read
          const unreadMessages = chatMessages
            .filter(msg => !msg.read && msg.senderId !== currentUser.uid)
            .map(msg => msg.id);
            
          if (unreadMessages.length > 0) {
            markMessagesAsRead(roomId, unreadMessages);
          }
        }
      } catch (error) {
        console.error('Error fetching chat room data:', error);
        setError('Failed to load chat room data');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRoomData();
    
    // Set up real-time listener for new messages
    if (roomId) {
      const unsubscribe = listenToChatMessages(roomId, async (chatMessages) => {
        // Convert to Message format
        const formattedMessages = await Promise.all(chatMessages.map(async (msg) => {
          let senderProfile;
          
          if (msg.senderId === currentUser.uid) {
            senderProfile = {
              id: currentUser.uid,
              name: currentUser.displayName || 'You',
              avatar: currentUser.photoURL || undefined
            };
          } else {
            if (otherUser) {
              senderProfile = otherUser;
            } else {
              const profile = await getUserProfile(msg.senderId);
              senderProfile = {
                id: msg.senderId,
                name: profile.displayName,
                avatar: profile.photoURL
              };
            }
          }
          
          return {
            id: msg.id,
            text: msg.text,
            sender: senderProfile,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
          };
        }));
        
        setMessages(formattedMessages);
        
        // Mark new messages as read
        const unreadMessages = chatMessages
          .filter(msg => !msg.read && msg.senderId !== currentUser.uid)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          markMessagesAsRead(roomId, unreadMessages);
        }
      });
      
      return () => unsubscribe();
    }
  }, [roomId, currentUser]);

  const handleSendMessage = async (text: string) => {
    if (!roomId || !currentUser || !text.trim()) return;
    
    try {
      const messageData: Omit<ChatMessage, 'id'> = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'You',
        text,
        timestamp: new Date(),
        read: false
      };
      
      await sendMessage(roomId, messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p>Please log in to view this chat</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading chat...</p>
      </div>
    );
  }

  if (!chatRoom || !otherUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chat room not found</p>
      </div>
    );
  }

  const currentUserFormatted = {
    id: currentUser.uid,
    name: currentUser.displayName || 'You',
    avatar: currentUser.photoURL || undefined
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)]">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="h-full">
        <Chat
          initialMessages={messages}
          currentUser={currentUserFormatted}
          title={otherUser.name}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatRoom; 