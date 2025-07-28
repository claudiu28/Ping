import { User } from "@/hooks/useUserData";

export interface CommentsResponse {
  id: number;
  text: string;
  username: string;
  profilePicture: string | null;
  message?: string | null;
}

export type AddCommentRequest = {
    text: string;
}

export type AddCommentResponse = {
    id: number;
    text: string,
    username: string,
    profilePicture: string,
    message: string
}
export interface Post {
    id?: number
    description?: string
    mediaUrl?: string
    contentType?: string
    user?: User
    likes?: number
    comments?: Comment[]
}
export interface FeedPost {
  id: number;
  mediaUrl: string;
  contentType: string;
  description: string;
  profilePicture: string;
  username: string;
}

export interface LikeResponse {
  id: number;
  message: string;
  userId: number;
  postId: number;
}

export interface PostCreateResponse {
  id: number;
  mediaUrl: string;
  contentType: string;
  description: string;
  profilePicture: string;
  username: string;
  message: string;
}