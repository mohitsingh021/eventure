import React, { useState } from 'react';
import ChatList, { Message } from './ChatList';
import ChatInput from './ChatInput';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { v4 as uuidv4 } from 'uuid';

interface ChatProps {
  initialMessages?: Message[];
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSendMessage?: (message: string) => void;
  title?: string;
  disabled?: boolean;
}

const Chat: React.FC<ChatProps> = ({
  initialMessages = [],
  currentUser,
  onSendMessage,
  title = 'Chat',
  disabled = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender: currentUser,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    if (onSendMessage) {
      onSendMessage(text);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      {title && (
        <CardHeader className="p-4 border-b">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ChatList messages={messages} currentUserId={currentUser.id} />
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

export default Chat; 