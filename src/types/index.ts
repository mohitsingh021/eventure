import { Timestamp } from 'firebase/firestore';

export type UserRole = 'organizer' | 'sponsor';

// Base user interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL: string;
  coverImageURL?: string;
  about: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Event Organizer
export interface Organizer extends User {
  role: 'organizer';
  pastEvents: string;
  upcomingEvents: UpcomingEvent[];
}

export interface UpcomingEvent {
  id: string;
  name: string;
  date: Timestamp;
  description: string;
  budgetRange: string;
  audienceType: string;
  sponsorshipRequirements: string;
}

// Sponsor
export interface Sponsor extends User {
  role: 'sponsor';
  companyName: string;
  eventTypesSponsored: string[];
  preferredPromotionFormat: string[];
}

// Post
export interface Post {
  id: string;
  userId: string;
  userRole: UserRole;
  displayName: string;
  userPhotoURL: string;
  content: string;
  mediaURL?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Comment
export interface Comment {
  id: string;
  userId: string;
  displayName: string;
  userPhotoURL: string;
  content: string;
  createdAt: Timestamp;
}

// Chat Message
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  fileURL?: string;
  fileName?: string;
  fileType?: string;
  timestamp: Timestamp;
  read: boolean;
}

// Chat Room
export interface ChatRoom {
  id: string;
  name: string;
  participants: string[]; // user IDs
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: Date | string | number;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'like' | 'comment';
  sourceId: string; // ID of the message, post, or comment
  sourceUserId: string; // User who triggered the notification
  sourceUserName: string;
  sourceUserPhoto: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date | string | number;
  read: boolean;
} 