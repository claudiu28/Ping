export interface DeleteResponse {
  id: number;
}
export interface Notification {
  username?: string;
  profilePicture?: string;
  text?: string;
  notificationId?: number;
  read?: boolean;
}