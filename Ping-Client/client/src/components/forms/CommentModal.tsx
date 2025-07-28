import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/sheared/apiClient";
import { addComment, getComments } from "@/constants/const";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/app/context/WebSocketContext";
import { User } from "@/hooks/useUserData";
import {
  AddCommentRequest,
  AddCommentResponse,
  CommentsResponse,
} from "@/types/posts/posts";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: number;
  currentUser: User | null;
}
export default function CommentsModal({
  isOpen,
  onClose,
  postId,
  currentUser,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CommentsResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const client = useWebSocket();
  useEffect(() => {
    if (!client || !currentUser?.username) return;

    const subscription = client.subscribe(
      `/topic/comment/${currentUser.username}`,
      (message) => {
        const data = JSON.parse(message.body);
        setComments((previous) => {
          return [
            ...previous,
            {
              id: data.id,
              text: data.text,
              username: data.username,
              profilePicture: data.profilePicture,
            },
          ];
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, currentUser?.username]);

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const response = await apiClient<void, CommentsResponse>({
        url: getComments(postId),
        method: "GET",
      });
      if (!Array.isArray(response)) {
        setError("Failed to load comments. Please try again later.");
        return;
      }
      setComments(response);
    } catch (err: any) {
      setError("Failed to load comments. Please try again later.");
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !postId || currentUser?.id === undefined) return;
    setLoading(true);
    try {
      const response = await apiClient<AddCommentRequest, AddCommentResponse>({
        url: addComment(postId, currentUser?.id),
        method: "POST",
        body: {
          text: newComment.trim(),
        } as AddCommentRequest,
      });
      if (
        response.id === undefined ||
        response.text === undefined ||
        response.username === undefined
      ) {
        setNewComment("");
        return;
      }
      setNewComment(response.text);
      fetchComments().then();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments().then();
    }
  }, [isOpen, postId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-red-800">
        <DialogHeader>
          <DialogTitle className="text-white">Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
          <ScrollArea className="max-h-[300px] pr-2">
            {comments.length > 0 ? (
              comments.map((comment, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 justify-start border-b border-red-800 pb-2 mb-2"
                >
                  <Avatar className="w-10 h-10 border-2 border-red-800">
                    <AvatarImage
                      src={
                        comment?.profilePicture?.startsWith("http")
                          ? comment?.profilePicture
                          : comment?.profilePicture
                          ? `http://localhost:8081/${comment?.profilePicture}`
                          : undefined
                      }
                      className="object-contain max-w-full max-h-full"
                    />
                    <AvatarFallback className="bg-red-800 text-white">
                      {comment?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-white">
                    <strong className="text-red-700">{comment.username}</strong>
                    : {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No comments yet</p>
            )}
          </ScrollArea>
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="dark-red-input text-white placeholder-gray-400"
          />
          <Button
            onClick={handlePostComment}
            disabled={!newComment.trim() || loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
