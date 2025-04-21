import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { Message } from './ChatList';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isCurrentUser ? "ml-auto" : ""
    )}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          {message.sender.avatar && (
            <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
          )}
          <AvatarFallback>{message.sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "rounded-lg p-3 text-sm",
        isCurrentUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <div className="flex flex-col">
          {!isCurrentUser && (
            <span className="font-semibold text-xs mb-1">{message.sender.name}</span>
          )}
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <span className="text-xs mt-1 self-end opacity-70">
            {format(message.timestamp, 'p')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 