"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import { apiClient } from "@/sheared/apiClient";
import { getPending, respondFriendship } from "@/constants/const";
import { useWebSocket } from "@/app/context/WebSocketContext";
import { User } from "@/hooks/useUserData";
import { FriendshipRequest } from "@/types/friends/friends";

interface FriendRequestsDropdownProps {
  user: User | null;
}

export default function FriendRequestsDropdown({
  user,
}: FriendRequestsDropdownProps) {
  const [friendshipRequests, setFriendshipRequests] = useState<
    FriendshipRequest[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const client = useWebSocket();

  const handleFriendsRequests = async () => {
    if (!user?.username) return;
    try {
      const response = await apiClient<void, FriendshipRequest>({
        url: getPending(user.username),
        method: "GET",
      });
      if (!response || !Array.isArray(response)) {
        setError("Invalid response format");
        return;
      }
      setFriendshipRequests(response);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const responseFriendRequest = async (requestId: number, type: string) => {
    try {
      const response = await apiClient<void, FriendshipRequest>({
        url: respondFriendship(requestId, type),
        method: "POST",
      });
      setFriendshipRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
    } catch (err) {
      console.error("Error responding to friend request:", err);
    }
  };

  useEffect(() => {
    if (!client || !user?.username) return;

    const subscription = client.subscribe(
      `/topic/friends/${user.username}`,
      (message) => {
        const data = JSON.parse(message.body);
        return setFriendshipRequests((previous) => [
          ...previous,
          {
            id: data.idFriendship,
            senderUsername: data.senderName,
            receiverUsername: data.receiverName,
            senderProfileImage: data.senderProfilePicture,
            receiverProfileImage: data.receiverProfilePicture,
          },
        ]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, user?.username]);

  useEffect(() => {
    handleFriendsRequests().then();
  }, [user]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-red-700 hover:text-red-800"
      >
        <Users className="w-5 h-5" />
        {friendshipRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {friendshipRequests.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[380px] z-50 rounded-md border border-red-800 bg-black shadow-lg">
          <div className="p-4 border-b border-red-800">
            <h3 className="font-semibold text-white text-base">
              Friend Requests
            </h3>
          </div>

          <ScrollArea className="max-h-[500px]">
            {friendshipRequests.length > 0 ? (
              friendshipRequests.map((request) => (
                <div
                  key={`${request.id}`}
                  className="px-4 py-3 border-b border-red-700/50 hover:bg-red-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10 border border-red-800">
                        <AvatarImage
                          src={
                            request?.senderProfileImage?.startsWith("http")
                              ? request.senderProfileImage
                              : request.senderProfileImage
                              ? `http://localhost:8081/${request.senderProfileImage}`
                              : undefined
                          }
                          className="object-contain max-w-full max-h-full"
                        />
                        <AvatarFallback className="bg-red-800 text-white">
                          {request.senderUsername?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <p className="text-sm font-medium text-white truncate max-w-[120px]">
                        {request.senderUsername}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          request?.id !== undefined &&
                          responseFriendRequest(request.id, "Accepted")
                        }
                        className="bg-red-700 hover:bg-red-800 text-white text-xs"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          request?.id !== undefined &&
                          responseFriendRequest(request.id, "Rejected")
                        }
                        className="border-red-800 text-red-700 bg-transparent text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No friend requests</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
