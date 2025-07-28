"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, MessageCircle, Trash } from "lucide-react";
import { apiClient } from "@/sheared/apiClient";
import {
  conversationDetails,
  createGroup,
  createPrivate,
  deleteConversation,
  getConversations,
  sendMessage,
} from "@/constants/const";
import {
  AcceptedFriends,
  useAcceptedFriends,
} from "@/hooks/useAcceptedFriends";
import { useWebSocket } from "@/app/context/WebSocketContext";
import { User } from "@/hooks/useUserData";
import {
  Conversation,
  DeleteConversationResponse,
  DetailsConversations,
  GroupRequest,
  GroupResponse,
  MessageRequest,
  MessageResponse,
  PrivateResponse,
} from "@/types/chat/chat";

interface ChatTabProps {
  user: User | null;
}

export default function ChatTab({ user }: ChatTabProps) {
  const [acceptedFriends, setAcceptedFriends] = useState<AcceptedFriends[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [details, setDetails] = useState<DetailsConversations[]>([]);
  const [error, setError] = useState<string>("");
  const [chatName, setChatName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [privateDialogOpen, setPrivateDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>(
    []
  );
  const [selectedPrivateMember, setSelectedPrivateMember] = useState<
    string | null
  >(null);
  const [chatMessage, setChatMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [details]);

  const client = useWebSocket();

  useEffect(() => {
    if (!client || !user?.username) return;

    const subscription = client.subscribe(
      `/topic/conversations/${selectedChat?.id}`,
      (message) => {
        const data = JSON.parse(message.body);
        setDetails((previous) => [
          ...previous,
          {
            conversationId: data.conversationId,
            sender: {
              username: data.username,
              profilePicture: data.pictureProfile,
            },
            id: data.messageId,
            text: data.text,
            messageResponse: "",
          },
        ]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, selectedChat, user?.username]);
  const fetchUserConversations = async () => {
    if (!user?.username) {
      setError("User is not defined");
      return;
    }
    try {
      const response = await apiClient<void, Conversation[]>({
        url: getConversations(user.username),
        method: "GET",
      });
      if (!Array.isArray(response)) {
        setError("Unexpected response format");
        return;
      }
      setConversations(response);
    } catch (err: any) {
      setConversations([]);
      setError(err.message);
    }
  };

  const fetchAllAcceptedFriends = async () => {
    if (user?.username === undefined) {
      setError("User is not defined");
      return;
    }
    try {
      const response = await useAcceptedFriends(user?.username);
      if (!Array.isArray(response)) {
        setError("Unexpected response format");
        return;
      }
      setAcceptedFriends(response);
    } catch (err: any) {
      setAcceptedFriends([]);
      setError(err.message);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedChat(conversation);
    try {
      const response = await apiClient<void, DetailsConversations[]>({
        url: conversationDetails(conversation.id),
        method: "GET",
      });
      if (Array.isArray(response)) {
        setDetails(response);
      } else {
        setDetails([]);
        setError("Unexpected response format");
      }
    } catch (err: any) {
      setDetails([]);
      setError(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedChat) return;

    try {
      if (!user?.username) {
        setError("User not found");
        return;
      }
      const response = await apiClient<MessageRequest, MessageResponse>({
        url: sendMessage(selectedChat.id, user?.username),
        method: "POST",
        body: {
          text: chatMessage.trim(),
        },
      });
      if (!response || !response.id || !response.text) {
        setError("Failed to send message");
        return;
      }
      setChatMessage("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createPrivateChat = async (
    friendUsername: string,
    chatName: string
  ) => {
    if (!user?.username) {
      setError("User not found");
      return;
    }
    try {
      await apiClient<void, PrivateResponse>({
        url: createPrivate(user?.username, friendUsername, chatName),
        method: "POST",
      });
      setPrivateDialogOpen(false);
      fetchUserConversations().then();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createGroupChat = async (groupName: string) => {
    try {
      if (!user?.username) {
        setError("User not found");
        return;
      }
      await apiClient<GroupRequest, GroupResponse>({
        url: createGroup(groupName),
        method: "POST",
        body: {
          usernames: [user.username, ...selectedGroupMembers],
        } as GroupRequest,
      });
      setGroupDialogOpen(false);
      setSelectedGroupMembers([]);
      fetchUserConversations().then();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      if (!user?.username) {
        setError("User not found");
        return;
      }
      await apiClient<void, DeleteConversationResponse>({
        url: deleteConversation(conversationId),
        method: "DELETE",
      });
      fetchUserConversations().then();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUserConversations().then();
    fetchAllAcceptedFriends().then();
  }, [user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      <Card className="lg:col-span-1 border-red-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">Conversations</h3>
            <div className="space-x-2">
              <Button
                size="sm"
                onClick={() => setPrivateDialogOpen(true)}
                className="text-xs"
              >
                Private
              </Button>
              <Button
                size="sm"
                onClick={() => setGroupDialogOpen(true)}
                className="text-xs"
              >
                Group
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.map((conv) => {
              const isPrivate =
                conv.name === null && conv.conversationType === "PRIVATE";
              const isGroup =
                conv.name === null && conv.conversationType === "GROUP";
              const other = conv.members.find(
                (m) => m.username !== user?.username
              );
              const first = conv.members[0];

              const profileImageSrc = isPrivate
                ? other?.profilePicture?.startsWith("http")
                  ? other.profilePicture
                  : other?.profilePicture
                  ? `http://localhost:8081/${other.profilePicture}`
                  : undefined
                : isGroup
                ? first?.profilePicture?.startsWith("http")
                  ? first.profilePicture
                  : first?.profilePicture
                  ? `http://localhost:8081/${first.profilePicture}`
                  : undefined
                : undefined;

              const fallbackText = isPrivate
                ? other?.username?.slice(0, 2).toUpperCase() ?? "U"
                : isGroup
                ? conv.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "G"
                : conv.name?.slice(0, 2).toUpperCase() ?? "C";

              const displayName =
                conv.name ||
                conv.members
                  .filter((u) => u.username !== user?.username)
                  .map((u) => u.username)
                  .join(", ");

              return (
                <div
                  key={conv.id}
                  className={`cursor-pointer border-b border-red-700 px-4 py-3 hover:bg-red-800 flex items-center justify-between ${
                    selectedChat?.id === conv.id ? "bg-red-800" : ""
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border border-red-800">
                      <AvatarImage
                        src={profileImageSrc}
                        className="object-contain max-w-full max-h-full"
                      />
                      <AvatarFallback className="bg-red-900 text-white">
                        {fallbackText}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm text-white truncate max-w-[160px]">
                      {displayName}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id).then();
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 border-red-800">
        {selectedChat ? (
          <>
            <CardHeader className="border-b border-red-800">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border border-red-800">
                  <AvatarImage
                    src={(() => {
                      const isPrivate =
                        selectedChat.name === null &&
                        selectedChat.conversationType === "PRIVATE";
                      const isGroup =
                        selectedChat.name === null &&
                        selectedChat.conversationType === "GROUP";

                      const other = selectedChat.members.find(
                        (m) => m.username !== user?.username
                      );
                      const first = selectedChat.members[0];

                      return isPrivate
                        ? other?.profilePicture?.startsWith("http")
                          ? other.profilePicture
                          : other?.profilePicture
                          ? `http://localhost:8081/${other.profilePicture}`
                          : undefined
                        : isGroup
                        ? first?.profilePicture?.startsWith("http")
                          ? first.profilePicture
                          : first?.profilePicture
                          ? `http://localhost:8081/${first.profilePicture}`
                          : undefined
                        : undefined;
                    })()}
                    className="object-contain max-w-full max-h-full"
                  />
                  <AvatarFallback className="bg-red-800 text-white">
                    {(() => {
                      const isPrivate =
                        selectedChat.name === null &&
                        selectedChat.conversationType === "PRIVATE";
                      const isGroup =
                        selectedChat.name === null &&
                        selectedChat.conversationType === "GROUP";
                      const other = selectedChat.members.find(
                        (m) => m.username !== user?.username
                      );
                      return isPrivate
                        ? other?.username?.slice(0, 2).toUpperCase() ?? "U"
                        : isGroup
                        ? selectedChat.name
                            ?.split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() ?? "G"
                        : selectedChat.name?.slice(0, 2).toUpperCase() ?? "C";
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">
                    {selectedChat.name ||
                      (() => {
                        return (
                          selectedChat.name ||
                          selectedChat.members
                            .filter((u) => u.username !== user?.username)
                            .map((u) => u.username)
                            .join(", ")
                        );
                      })()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px] p-0">
              <div className="flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {details.map((msg) => {
                      const isOwnMessage =
                        msg.sender.username === user?.username;
                      const profilePicture =
                        msg.sender.profilePicture?.startsWith("http")
                          ? msg.sender.profilePicture
                          : msg.sender.profilePicture
                          ? `http://localhost:8081/${msg.sender.profilePicture}`
                          : undefined;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-end space-x-2 ${
                              isOwnMessage
                                ? "flex-row-reverse space-x-reverse"
                                : "flex-row"
                            }`}
                          >
                            <Avatar className="w-8 h-8 border border-red-800">
                              <AvatarImage
                                src={profilePicture}
                                className="object-contain max-w-full max-h-full"
                              />
                              <AvatarFallback className="bg-red-900 text-white">
                                {msg.sender.username
                                  ?.slice(0, 2)
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`p-3 rounded-lg max-w-xs ${
                                isOwnMessage
                                  ? "bg-red-700 text-white"
                                  : "bg-black/50 text-white border border-red-800"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                          <div ref={bottomRef} />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="border-t border-red-800 p-4 flex items-center gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 rounded-lg border-red-800 text-white"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="bg-red-700 hover:bg-red-800 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                Select a conversation to start chatting
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog open={privateDialogOpen} onOpenChange={setPrivateDialogOpen}>
        <DialogContent className="border-red-800">
          <DialogHeader>
            <DialogTitle className="text-white">Choose a friend</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Private chat name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            className="text-white"
          />

          <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
            {acceptedFriends.map((f) => {
              const friend =
                f.receiverUsername === user?.username
                  ? {
                      username: f.senderUsername,
                      profilePicture: f.senderProfileImage,
                    }
                  : {
                      username: f.receiverUsername,
                      profilePicture: f.receiverProfileImage,
                    };

              if (!friend.username) return null;

              const profileImage = friend.profilePicture?.startsWith("http")
                ? friend.profilePicture
                : friend.profilePicture
                ? `http://localhost:8081/${friend.profilePicture}`
                : undefined;

              return (
                <Card
                  key={friend.username}
                  className={`cursor-pointer p-2 hover:bg-red-800 border-red-700 ${
                    selectedPrivateMember === friend.username
                      ? "bg-red-900"
                      : ""
                  }`}
                  onClick={() => {
                    if (friend.username !== undefined) {
                      setSelectedPrivateMember(friend.username);
                    }
                  }}
                >
                  <div className="flex space-x-3 items-center">
                    <Avatar>
                      <AvatarImage
                        src={profileImage}
                        className="object-contain max-w-full max-h-full"
                      />
                      <AvatarFallback className="bg-red-700 text-white">
                        {friend.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white">{friend.username}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            className="mt-4 bg-red-800 hover:bg-red-900 text-white"
            onClick={() => {
              if (selectedPrivateMember && chatName.trim() !== "") {
                createPrivateChat(selectedPrivateMember, chatName);
                setPrivateDialogOpen(false);
                setChatName("");
                setSelectedPrivateMember(null);
              }
            }}
            disabled={!selectedPrivateMember || chatName.trim() === ""}
          >
            Create Private Chat
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="border-red-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Select group members
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="text-white"
          />

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 mt-2">
            {acceptedFriends.map((f) => {
              const friend =
                f.receiverUsername === user?.username
                  ? {
                      username: f.senderUsername,
                      profilePicture: f.senderProfileImage,
                    }
                  : {
                      username: f.receiverUsername,
                      profilePicture: f.receiverProfileImage,
                    };

              if (!friend.username) return null;

              const profileImage = friend.profilePicture?.startsWith("http")
                ? friend.profilePicture
                : friend.profilePicture
                ? `http://localhost:8081/${friend.profilePicture}`
                : undefined;
              return (
                <div
                  key={friend.username}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="w-8 h-8 border border-red-800">
                    <AvatarImage
                      src={profileImage}
                      className="object-contain max-w-full max-h-full"
                    />
                    <AvatarFallback className="bg-red-900 text-white">
                      {friend.username.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <Checkbox
                    checked={selectedGroupMembers.includes(friend.username!)}
                    onCheckedChange={(checked) => {
                      const username = friend.username;
                      if (!username) return;

                      setSelectedGroupMembers((prev) =>
                        checked
                          ? prev.includes(username)
                            ? prev
                            : [...prev, username]
                          : prev.filter((u) => u !== username)
                      );
                    }}
                  />
                  <span className="text-white">{friend.username}</span>
                </div>
              );
            })}
          </div>

          <Button
            className="mt-4 bg-red-800 hover:bg-red-900 text-white"
            onClick={() => createGroupChat(groupName)}
            disabled={
              selectedGroupMembers.length < 2 || groupName.trim() === ""
            }
          >
            Create Group
          </Button>
        </DialogContent>
      </Dialog>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
