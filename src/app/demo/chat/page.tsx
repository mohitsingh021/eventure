'use client';
import React from 'react';
import Chat from '../../../components/Chat/Chat';
import { Message } from '../../../components/Chat/ChatList';
import { v4 as uuidv4 } from 'uuid';

const DemoChatPage: React.FC = () => {
  const currentUser = {
    id: '1',
    name: 'You',
    avatar: '/avatar-user.png', // Optional: add an avatar image
  };

  const otherUser = {
    id: '2',
    name: 'John Doe',
    avatar: '/avatar-other.png', // Optional: add an avatar image
  };

  // Sample initial messages for demonstration
  const initialMessages: Message[] = [
    {
      id: uuidv4(),
      text: 'Hey there! How are you doing?',
      sender: otherUser,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: uuidv4(),
      text: 'I\'m doing great! Just finished setting up the chat component for our app.',
      sender: currentUser,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: uuidv4(),
      text: 'That\'s awesome! It looks really good. Can you tell me more about the features?',
      sender: otherUser,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    }
  ];

  return (
    <div className="container mx-auto py-8 h-screen">
      <h1 className="text-3xl font-bold mb-6">Chat Component Demo</h1>
      <div className="h-[calc(100vh-200px)]">
        <Chat 
          initialMessages={initialMessages}
          currentUser={currentUser}
          title="Demo Chat"
          onSendMessage={(message) => console.log('New message:', message)}
        />
      </div>
    </div>
  );
};

export default DemoChatPage; 