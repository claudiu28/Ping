"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";
import { apiClient } from "@/sheared/apiClient";
import { SendFriendRequestResponse } from "@/types/friends/friends";
import { getSendFriendRequest, getSuggestedFriends } from "@/constants/const";
import { User } from "@/hooks/useUserData";

interface FriendsTabProps {
  user: User | null;
}

export default function FriendsTab({ user }: FriendsTabProps) {
  const [suggestedFriends, setSuggestedFriends] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const handleSuggestedFriends = async () => {
    try {
      if (user?.username === undefined) {
        setError("You must be logged in to view suggested friends.");
        return;
      }
      const res = await apiClient<void, User[]>({
        url: getSuggestedFriends(user?.username),
        method: "GET",
      });
      if (res && Array.isArray(res)) {
        setSuggestedFriends(res);
        setError("");
      } else {
        setError("Failed to load suggested friends.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendFriendRequest = async (receiverUsername: string) => {
    try {
      if (user?.username === undefined) {
        setError("You must be logged in to send friend requests.");
        return;
      }
      const response = await apiClient<void, SendFriendRequestResponse>({
        url: getSendFriendRequest(user?.username, receiverUsername),
        method: "POST",
      });

      if (response.id) {
        setError("");
        alert("Friend request sent successfully!");
      } else {
        if (response.message !== undefined) setError(response.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    handleSuggestedFriends().then();
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suggestedFriends.map((friend) => (
        <Card key={friend.id} className="border-red-800">
          <CardContent className="p-6 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-red-800">
              <AvatarImage
                src={
                  friend?.profilePicture?.startsWith("http")
                    ? friend?.profilePicture
                      ? friend?.profilePicture
                      : `http://localhost:8081/${friend?.profilePicture}`
                    : undefined
                }
              />
              <AvatarFallback className="bg-red-800 text-white text-lg">
                {friend?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-white text-lg mb-1">
              {friend.firstName} {friend.lastName}
            </h3>
            <p className="text-sm text-gray-400 mb-3">@{friend.username}</p>
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">
              {friend.bio}
            </p>
            <Button
              size="sm"
              className="w-full dark-red-button"
              onClick={() =>
                friend.username && handleSendFriendRequest(friend.username)
              }
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Send Friend Request
            </Button>
          </CardContent>
          {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
        </Card>
      ))}
    </div>
  );
}
