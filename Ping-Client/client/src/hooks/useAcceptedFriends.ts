import {apiClient} from "@/sheared/apiClient";
import {getAcceptedFriends} from "@/constants/const";

export interface AcceptedFriends {
  message?: string;
  id?: number;
  senderUsername?: string;
  receiverUsername?: string;
  senderProfileImage?: string;
  receiverProfileImage?: string;
}

export const useAcceptedFriends = async (username: string) => {
    return await apiClient<void, AcceptedFriends[]>({
        url: getAcceptedFriends(username),
        method: "GET",
    })
}
