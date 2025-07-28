export type SendFriendRequestResponse = {
    message?: string,
    id?: number,
    senderUsername?: string,
    receiverUsername?: string,
    senderProfileImage?: string,
    receiverProfileImage?: string
}
export interface FriendshipRequest {
  message?: string;
  id?: number;
  senderUsername?: string;
  receiverUsername?: string;
  senderProfileImage?: string;
  receiverProfileImage?: string;
}