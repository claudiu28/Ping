"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreatePostModal from "./PostModal";
import PostCard from "./PostCard";
import { apiClient } from "@/sheared/apiClient";
import {
  feedPost,
  getSendFriendRequest,
  getSuggestedFriends,
  numberOfLikes,
} from "@/constants/const";
import { SendFriendRequestResponse } from "@/types/friends/friends";
import { User } from "@/hooks/useUserData";
import { FeedPost } from "@/types/posts/posts";

interface FeedTabProps {
  user: User | null;
}

export default function FeedTab({ user }: FeedTabProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<User[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [likesPerPost, setLikesPerPost] = useState<Record<number, number>>({});

  const loadAllLikes = async (fetchedPosts: FeedPost[]) => {
    const counts: Record<number, number> = {};
    await Promise.all(
      fetchedPosts.map(async (post) => {
        try {
          const res = await apiClient<void, number>({
            url: numberOfLikes(post.id),
            method: "GET",
          });
          counts[post.id] = res;
        } catch (err: any) {
          setError(err.message);
        }
      })
    );
    setLikesPerPost(counts);
  };

  const getPosts = async () => {
    if (!user?.username) {
      setError("You must be logged in to view posts.");
      return;
    }
    try {
      const response = await apiClient<void, FeedPost[]>({
        url: feedPost(user.username),
        method: "GET",
      });
      setPosts(response);
      await loadAllLikes(response);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLikeChange = async (postId: number) => {
    try {
      const res = await apiClient<void, number>({
        url: numberOfLikes(postId),
        method: "GET",
      });
      setLikesPerPost((prev) => ({ ...prev, [postId]: res }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const takeSuggestedFriends = async () => {
    try {
      if (!user?.username) return;
      const res = await apiClient<void, User[]>({
        url: getSuggestedFriends(user.username),
        method: "GET",
      });
      if (Array.isArray(res)) setSuggestedFriends(res);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const takeSendFriendRequest = async (receiverUsername: string) => {
    try {
      if (!user?.username) return;
      const response = await apiClient<void, SendFriendRequestResponse>({
        url: getSendFriendRequest(user.username, receiverUsername),
        method: "POST",
      });
      if (!response.id && response.message) setError(response.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    getPosts();
    takeSuggestedFriends();
  }, [user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <Card className="border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-red-800">
                <AvatarImage
                  src={
                    user?.profilePicture?.startsWith("http")
                      ? user.profilePicture
                      : `http://localhost:8081/${user?.profilePicture}`
                  }
                  className="object-contain max-w-full max-h-full"
                />
                <AvatarFallback className="bg-red-800 text-white">
                  {user?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-gray-400 bg-black border-red-750 hover:bg-red-800"
                onClick={() => setIsPostModalOpen(true)}
              >
                What's on your mind, {user?.username}?
              </Button>
            </div>
          </CardContent>
        </Card>

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            likes={likesPerPost[post.id] ?? 0}
            onLikeChange={handleLikeChange}
          />
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <Card className="border-red-800">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Suggested Friends
              </h3>
              {suggestedFriends.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No suggestions available.
                </p>
              ) : (
                suggestedFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8 border-2 border-red-800">
                        <AvatarImage
                          src={
                            friend.profilePicture?.startsWith("http")
                              ? friend.profilePicture
                              : `http://localhost:8081/${friend.profilePicture}`
                          }
                          className="object-contain max-w-full max-h-full"
                        />
                        <AvatarFallback className="bg-red-800 text-white">
                          {friend.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white text-sm font-medium">
                        {friend.username}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-800 text-red-700 hover:bg-red-800 hover:text-white"
                      onClick={() => takeSendFriendRequest(friend.username!)}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        user={user}
        onPostCreated={getPosts}
      />
    </div>
  );
}
