"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, Trash } from "lucide-react";
import { Post } from "@/types/posts/posts";
import { apiClient } from "@/sheared/apiClient";
import {
  deleteFriendship,
  deletePhoto,
  deletePostUser,
  getUserPosts,
  updateInformationProfile,
  uploadPhoto,
} from "@/constants/const";
import {
  AcceptedFriends,
  useAcceptedFriends,
} from "@/hooks/useAcceptedFriends";
import { useWebSocket } from "@/app/context/WebSocketContext";
import { User } from "@/hooks/useUserData";
import {
  DeleteFriendshipResponse,
  DeletePostRequest,
  UpdateInformationProfileRequest,
  UpdateInformationProfileResponse,
  UploadPictureResponse,
} from "@/types/profile/profile";

export interface ProfileTabProps {
  user: User | null;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<User | null>(user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [acceptedFriends, setAcceptedFriends] = useState<AcceptedFriends[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const client = useWebSocket();
  useEffect(() => {
    if (!client || !userData?.username) return;

    const subscription = client.subscribe(
      `/topic/update-picture/${userData.username}`,
      (message) => {
        const data = JSON.parse(message.body);
        setUserData((prev) => ({
          ...prev,
          profilePicture: data.profilePicture,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, userData?.username]);

  useEffect(() => {
    if (!client || !userData?.username) return;

    const subscription = client.subscribe(
      `/topic/update-info/${userData.username}`,
      (message) => {
        const data = JSON.parse(message.body);
        setUserData((prev) => ({
          ...prev,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          bio: data.bio,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, userData?.username]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleUserPost = async () => {
    try {
      if (!userData?.username) {
        setError("User not found! You should be logged in!");
        return;
      }
      setLoading(true);
      clearMessages();
      const response = await apiClient<void, Post[]>({
        url: getUserPosts(userData.username),
        method: "GET",
      });

      if (Array.isArray(response)) {
        setUserPosts(response);
        if (response.length === 0) {
          setSuccess("No posts found");
        }
      } else {
        setUserPosts([]);
        setError("Invalid response format");
      }
    } catch (err: any) {
      setError(err.message);
      setUserPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInformationUser = async () => {
    try {
      if (!userData?.username) {
        setError("User not found");
        return;
      }
      setLoading(true);
      clearMessages();

      const response = await apiClient<
        UpdateInformationProfileRequest,
        UpdateInformationProfileResponse
      >({
        url: updateInformationProfile(userData.username),
        method: "PATCH",
        body: {
          firstName: userData?.firstName?.trim() || "",
          lastName: userData?.lastName?.trim() || "",
          phone: userData?.phone?.trim() || "",
          bio: userData?.bio?.trim() || "",
        } as UpdateInformationProfileRequest,
      });

      if (response.id && response.username) {
        setSuccess("Profile updated successfully");
        setIsEditProfile(false);
      } else {
        setError("Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptedFriends = async () => {
    try {
      if (!userData?.username) {
        setError("User not found here! You should be logged in!");
        return;
      }
      const response = await useAcceptedFriends(userData.username);
      if (Array.isArray(response)) {
        setAcceptedFriends(response);
      } else {
        setAcceptedFriends([]);
      }
    } catch (err: any) {
      setAcceptedFriends([]);
    }
  };

  const uploadNewPicture = async () => {
    console.log(userData?.username);
    if (!selectedFile || userData?.username === undefined) {
      setError("No file selected or user not found");
      return;
    }
    setLoading(true);
    clearMessages();
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await apiClient<FormData, UploadPictureResponse>({
        url: uploadPhoto(userData.username),
        method: "POST",
        body: formData,
        isFormData: true,
      });

      if (response && response.profilePicture) {
        setSuccess("Picture uploaded successfully");
        setSelectedFile(null);
      } else {
        setError("Failed to upload picture");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload picture");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      if (!userData?.username) {
        setError("User not found! You should be logged in!");
        return;
      }
      setLoading(true);
      clearMessages();
      const response = await apiClient<void, User>({
        url: deletePhoto(userData.username),
        method: "POST",
      });
      if (response) {
        setSuccess("Picture deleted successfully");
      } else {
        setError("Failed to delete picture");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number, mediaUrl: string) => {
    try {
      if (!user?.username) {
        setError("User not found");
        return;
      }
      setLoading(true);
      clearMessages();

      const response = await apiClient<DeletePostRequest, Post>({
        url: deletePostUser(postId),
        method: "DELETE",
        body: {
          mediaUrl: mediaUrl,
        },
      });

      if (response.id !== 0) {
        setSuccess("Post deleted successfully");
        setUserPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== postId)
        );
      } else {
        setError("Failed to delete post");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFriendship = async (friendshipId: number) => {
    try {
      if (!user?.username) {
        setError("User not found");
        return;
      }

      setLoading(true);
      clearMessages();

      const response = await apiClient<void, DeleteFriendshipResponse>({
        url: deleteFriendship(friendshipId),
        method: "DELETE",
      });

      if (response.id) {
        setSuccess("Friendship deleted successfully");
        setAcceptedFriends((prevFriends) =>
          prevFriends.filter((friend) => friend.id !== friendshipId)
        );
      } else {
        setError("Failed to delete friendship");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setUserData(user);
      handleUserPost().then();
      handleAcceptedFriends().then();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card className="border-red-800">
        <CardHeader>
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24 border-4 border-red-800">
              <AvatarImage
                src={
                  userData?.profilePicture?.startsWith("http")
                    ? userData.profilePicture
                    : userData?.profilePicture
                    ? `http://localhost:8081/${userData?.profilePicture}`
                    : undefined
                }
                className="object-contain max-w-full max-h-full"
              />
              <AvatarFallback className="bg-red-700 text-white text-2xl">
                {userData?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {userData?.username}
              </h2>
              <p className="text-gray-400">@{userData?.username}</p>
              <p className="text-gray-400">
                Name: {userData?.firstName} {userData?.lastName}
              </p>
              <p className="text-white mb-4">{userData?.bio}</p>
              <div className="flex space-x-4 mt-2">
                <span
                  className="text-sm text-white cursor-pointer hover:text-red-700 transition-colors"
                  onClick={() => setShowFriendsModal(true)}
                >
                  <strong className="text-white">
                    {acceptedFriends.length}
                  </strong>{" "}
                  friends
                </span>
                <span className="text-sm text-gray-400">
                  <strong className="text-white">{userPosts.length}</strong>{" "}
                  posts
                </span>
                <span className="text-sm text-gray-400">
                  <strong className="text-white">{userData?.phone}</strong>{" "}
                  phone
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isEditProfile} onOpenChange={setIsEditProfile}>
            <DialogTrigger asChild>
              <Button className="dark-red-button" disabled={loading}>
                {loading ? "Loading..." : "Edit Profile"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-red-800">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Profile</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black">
                  <TabsTrigger value="info" className="text-white">
                    Information
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="text-white">
                    Profile Picture
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white">
                        First Name
                      </label>
                      <Input
                        value={userData?.firstName || ""}
                        placeholder="Your first name"
                        onChange={(e) =>
                          setUserData((prev) => ({
                            ...prev!,
                            firstName: e.target.value,
                          }))
                        }
                        className="text-white"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white">
                        Last Name
                      </label>
                      <Input
                        value={userData?.lastName || ""}
                        placeholder="Your last name"
                        onChange={(e) =>
                          setUserData((prev) => ({
                            ...prev!,
                            lastName: e.target.value,
                          }))
                        }
                        className="text-white"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">
                      Phone
                    </label>
                    <Input
                      value={userData?.phone}
                      placeholder="Your phone number"
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev!,
                          phone: e.target.value,
                        }))
                      }
                      className="text-white"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">
                      Bio
                    </label>
                    <Textarea
                      placeholder="Tell us something about yourself..."
                      className="min-h-[100px] text-white"
                      value={userData?.bio || ""}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-center space-x-2 mt-6 pt-4 border-t border-red-800">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditProfile(false)}
                      className="border-red-800 text-red-700 hover:bg-red-800"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleInformationUser} disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="photo" className="space-y-4 mt-4">
                  <div className="text-center space-y-4">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-red-800">
                      <AvatarImage
                        src={
                          userData?.profilePicture?.startsWith("http")
                            ? userData?.profilePicture
                            : userData?.profilePicture
                            ? `http://localhost:8081/${userData?.profilePicture}`
                            : undefined
                        }
                        className="object-contain max-w-full max-h-full"
                      />
                      <AvatarFallback className="bg-red-900 text-white text-2xl">
                        {userData?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                        disabled={loading}
                      />
                      <Button
                        variant="outline"
                        className="w-full border-red-800 text-red-700 hover:bg-red-800 bg-transparent"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Upload New Picture
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-red-700 hover:bg-red-800"
                        onClick={handleDeletePicture}
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "Delete Current Picture"}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Recommended size: 400x400px</p>
                      <p>Accepted formats: JPG, PNG, GIF</p>
                      <p>Max size: 5MB</p>
                    </div>
                    {selectedFile && (
                      <div className="space-y-2">
                        <p className="text-red-700 text-sm">
                          Selected: {selectedFile.name}
                        </p>
                        <Button
                          className="w-full dark-red-button"
                          onClick={uploadNewPicture}
                          disabled={loading}
                        >
                          {loading ? "Uploading..." : "Confirm Upload"}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Dialog open={showFriendsModal} onOpenChange={setShowFriendsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-red-800">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-white">
              Friends ({acceptedFriends.length})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {acceptedFriends.length > 0 ? (
              <div className="space-y-3">
                {acceptedFriends.map((friend) => {
                  const friendUsername =
                    friend.senderUsername === userData?.username
                      ? friend.receiverUsername
                      : friend.senderUsername;
                  const friendImage =
                    friend.senderUsername === userData?.username
                      ? friend.receiverProfileImage
                      : friend.senderProfileImage;
                  return (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-4 p-4 border border-red-700 rounded-lg hover:bg-red-800 transition-colors"
                    >
                      <Avatar className="w-14 h-14 border-2 border-red-800 flex-shrink-0">
                        <AvatarImage
                          src={
                            friendImage?.startsWith("http")
                              ? friendImage
                              : friendImage
                              ? `http://localhost:8081/${friendImage}`
                              : undefined
                          }
                          alt={friendUsername}
                          className="object-contain max-w-full max-h-full"
                        />
                        <AvatarFallback className="bg-red-800 text-white text-sm">
                          {friendUsername?.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1  items-center min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {friendUsername}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={() => {
                          if (friend.id !== undefined) {
                            handleDeleteFriendship(friend.id).then();
                          }
                        }}
                        disabled={loading}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Friendship
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No friends yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start connecting with other users to see them here!
                </p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex justify-end mt-4 pt-4 border-t border-red-800">
            <Button
              variant="outline"
              onClick={() => setShowFriendsModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {(error !== "" || success !== "") && (
        <div className="flex items-center justify-between border border-red-700 p-4 rounded-lg">
          <div className="flex gap-4">
            {error && <p className="text-red-700 text-sm">{error}</p>}
            {success && <p className="text-red-700 text-sm">{success}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-gray-400 hover:text-white"
          >
            Dismiss
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userPosts.map((post) => (
          <Card key={post.id} className=" border-red-800 relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-red-800">
                    <AvatarImage
                      src={
                        userData?.profilePicture?.startsWith("http")
                          ? userData?.profilePicture
                          : userData?.profilePicture
                          ? `http://localhost:8081/${userData?.profilePicture}`
                          : undefined
                      }
                      className="object-contain max-w-full max-h-full"
                    />
                    <AvatarFallback className="bg-red-800 text-white text-xs">
                      {userData?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-white text-sm">
                    {userData?.username}
                  </h3>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-800 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-black border-red-800"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        if (
                          post.id !== undefined &&
                          post.mediaUrl !== undefined
                        ) {
                          handleDeletePost(post.id, post.mediaUrl).then();
                        }
                      }}
                      className="text-red-700 hover:text-red-800 cursor-pointer"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-red-700 hover:text-red-800" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {post.mediaUrl && (
                <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg bg-gray-800">
                  <img
                    src={
                      post.mediaUrl?.startsWith("http")
                        ? post.mediaUrl
                        : `http://localhost:8081/${post.mediaUrl}`
                    }
                    alt="Post content"
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                </div>
              )}

              <p className="text-white text-sm leading-relaxed">
                {post.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {userPosts.length === 0 && !loading && (
        <Card className="border-red-800">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">No posts yet</p>
            <p className="text-gray-500 text-sm">
              Your posts will appear here once you start sharing!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
