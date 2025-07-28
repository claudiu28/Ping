import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { apiClient } from "@/sheared/apiClient";
import { postCreate } from "@/constants/const";
import { User } from "@/hooks/useUserData";
import { PostCreateResponse } from "@/types/posts/posts";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onPostCreated: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  user,
  onPostCreated,
}: CreatePostModalProps) {
  const [newPost, setNewPost] = useState("");
  const [selectedPostImage, setSelectedPostImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("description", newPost);
    formData.append("type", "IMAGE");
    if (selectedPostImage) {
      formData.append("file", selectedPostImage);
    }

    if (user?.username === undefined) {
      console.error("User is not logged in or username is not available.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiClient<FormData, PostCreateResponse>({
        url: postCreate(user.username),
        method: "POST",
        body: formData,
        isFormData: true,
      });

      if (response.mediaUrl && response.contentType && response.username) {
        setNewPost("");
        setSelectedPostImage(null);
        onClose();
        onPostCreated();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-red-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-red-800">
              <AvatarImage
                src={
                  user?.profilePicture?.startsWith("http")
                    ? user?.profilePicture
                    : user?.profilePicture
                    ? `http://localhost:8081/${user?.profilePicture}`
                    : undefined
                }
                className="object-contain max-w-full max-h-full"
              />
              <AvatarFallback className="bg-red-800 text-white">
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{user?.username}</p>
            </div>
          </div>
          <Textarea
            placeholder="What is on your mind, {user?.username}? Post now!!!"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[120px] resize-none border-red-800 bg-black text-white"
          />
          {selectedPostImage && (
            <div className="text-sm text-green-400">
              Image selected: {selectedPostImage.name}
            </div>
          )}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-red-700 hover:text-red-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedPostImage(e.target.files[0]);
                }
              }}
            />
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || isLoading}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
