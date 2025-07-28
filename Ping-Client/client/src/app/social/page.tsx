"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MessageCircle, User, Users } from "lucide-react";
import Header from "@/components/forms/Header";
import FeedTab from "@/components/forms/FeedTab";
import ChatTab from "@/components/forms/ChatTab";
import ProfileTab from "@/components/forms/ProfileTab";
import FriendsTab from "@/components/forms/FriendsTab";
import { useUserData } from "@/hooks/useUserData";

export default function SocialMediaApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("feed");
  const { user, loading } = useUserData();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-black border-red-800">
            <TabsTrigger
              value="feed"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md`}
            >
              <Home
                className={`w-4 h-4 ${
                  activeTab === "feed" ? "text-red-700" : "text-white"
                }`}
              />
              <span
                className={`${
                  activeTab === "feed" ? "text-red-700" : "text-white"
                }`}
              >
                Home
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="chat"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md`}
            >
              <MessageCircle
                className={`w-4 h-4 ${
                  activeTab === "chat" ? "text-red-700" : "text-white"
                }`}
              />
              <span
                className={`${
                  activeTab === "chat" ? "text-red-700" : "text-white"
                }`}
              >
                Chat
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md`}
            >
              <User
                className={`w-4 h-4 ${
                  activeTab === "profile" ? "text-red-700" : "text-white"
                }`}
              />
              <span
                className={` ${
                  activeTab === "profile" ? "text-red-700" : "text-white"
                }`}
              >
                Profile
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="friends"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md`}
            >
              <Users
                className={`w-4 h-4 ${
                  activeTab === "friends" ? "text-red-700" : "text-white"
                }`}
              />
              <span
                className={`${
                  activeTab === "friends" ? "text-red-700" : "text-white"
                }`}
              >
                Friends
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <FeedTab user={user} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab user={user} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="friends">
            <FriendsTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
