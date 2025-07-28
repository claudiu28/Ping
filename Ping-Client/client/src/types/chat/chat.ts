import { User } from "@/hooks/useUserData";

export interface MessageRequest {
  text: string;
}

export interface MessageResponse {
  conversationId: number;
  sender: User;
  id: number;
  text: string;
  messageResponse: string;
}
export interface ChatResponse {
  messageId: number;
  conversationId: number;
  username: string;
  pictureProfile: string;
  text: string;
}
export interface PrivateResponse {
  id: number;
  name: string;
  members: User[];
  message: string;
}

export interface GroupRequest {
  usernames: string[];
}

export interface GroupResponse {
  id: number;
  nameGroup: string;
  members: User[];
  message: string;
}

export interface DetailsConversations {
  conversationId: number;
  sender: User;
  id: number;
  text: string;
  messageResponse: string;
}

export interface Conversation {
  id: number;
  name: string;
  conversationType: string;
  members: User[];
  messageResponse: string;
}

export interface DeleteConversationResponse {
  message: string;
}

export interface MessageDeleteResponse {
  message: string;
}