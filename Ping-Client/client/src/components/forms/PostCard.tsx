"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import CommentsModal from "./CommentModal";
import { apiClient } from "@/sheared/apiClient";
import { likesManage, userLikesPost } from "@/constants/const";
import { User } from "@/hooks/useUserData";
import { FeedPost, LikeResponse } from "@/types/posts/posts";

interface PostCardProps {
  post: FeedPost;
  currentUser: User | null;
  likes: number;
  onLikeChange: (postId: number) => void;
}

export default function PostCard({
  post,
  currentUser,
  likes,
  onLikeChange,
}: PostCardProps) {
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState<string>("");
  const [postLiked, setPostLiked] = useState<number[]>([]);

  const handleLike = async () => {
    try {
      if (currentUser === null || currentUser.id === undefined) {
        setError("You must be logged in to like posts.");
        return;
      }
      const endpoint = liked ? "dislike" : "like";
      await apiClient<void, LikeResponse>({
        url: likesManage(post.id, currentUser.id, endpoint),
        method: "POST",
      });
      setLiked(!liked);
      setPostLiked((prev) =>
        liked ? prev.filter((id) => id !== post.id) : [...prev, post.id]
      );
      onLikeChange(post.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUserPostsLiked = async () => {
    try {
      if (currentUser === null || currentUser.id === undefined) {
        setError("You must be logged in to like posts.");
        return;
      }
      const response = await apiClient<void, LikeResponse[]>({
        url: userLikesPost(currentUser.id),
        method: "GET",
      });
      const postIds = response.map((like) => like.postId);
      setPostLiked(postIds);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (postLiked.length > 0) {
      setLiked(postLiked.includes(post.id));
    }
  }, [postLiked, post.id]);

  useEffect(() => {
    handleUserPostsLiked();
  }, []);

  return (
    <Card className="border-red-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-red-800">
              <AvatarImage
                src={
                  post.profilePicture.startsWith("http")
                    ? post.profilePicture
                    : `http://localhost:8081/${post.profilePicture}`
                }
                className="object-contain max-w-full max-h-full"
              />
              <AvatarFallback className="bg-red-800 text-white">
                {post.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{post.username}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-4 text-white">{post.description}</p>

        {post.mediaUrl && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-4 bg-black">
            <img
              src={
                post.mediaUrl.startsWith("http")
                  ? post.mediaUrl
                  : `http://localhost:8081/${post.mediaUrl}`
              }
              alt="Post content"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-red-800">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-red-700 hover:text-red-800"
            onClick={handleLike}
          >
            <span className="text-sm text-red-700">
              {likes} {likes === 1 ? "like" : "likes"}
            </span>
            {liked ? (
              <ThumbsDown className="w-4 h-4" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}

            <span>{liked ? "Unlike" : "Like"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 text-red-700 hover:text-red-800"
            onClick={() => setIsCommentsModalOpen(true)}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </Button>
        </div>
      </CardContent>
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        postId={post.id}
        currentUser={currentUser}
      />
      {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
    </Card>
  );
}
