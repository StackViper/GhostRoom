export interface Message {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string; // Encrypted
  nonce: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}
