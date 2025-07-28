"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { apiClient } from "@/sheared/apiClient";
import {
  deleteNotify,
  getNotificationsUnread,
  markAsReadNotify,
} from "@/constants/const";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useWebSocket } from "@/app/context/WebSocketContext";
import { User } from "@/hooks/useUserData";
import {
  DeleteResponse,
  Notification,
} from "@/types/notification/notification";

interface NotificationsDropdownProps {
  user: User | null;
}

export default function NotificationsDropdown({
  user,
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const client = useWebSocket();

  const fetchNotifications = async () => {
    if (!user?.username) return;
    try {
      const response = await apiClient<void, Notification>({
        url: getNotificationsUnread(user.username),
        method: "GET",
      });
      if (!Array.isArray(response)) {
        setError("Failed to load notifications. Please try again later.");
        return;
      }
      setNotifications(response);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await apiClient<void, Notification>({
        url: markAsReadNotify(notificationId),
        method: "PATCH",
      });
      if (response.notificationId) {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== notificationId)
        );
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await apiClient<void, DeleteResponse>({
        url: deleteNotify(notificationId),
        method: "DELETE",
      });

      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!client || !user?.username) return;

    const subscription = client.subscribe(
      `/topic/notifications/${user.username}`,
      (message) => {
        const data = JSON.parse(message.body);
        setNotifications((previous) => [
          ...previous,
          {
            username: data.username,
            profilePicture: data.profilePicture,
            text: data.text,
            notificationId: data.notificationId,
            read: data.isRead,
          },
        ]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, user?.username]);

  useEffect(() => {
    fetchNotifications().then();
  }, [user]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-red-700 hover:text-red-800"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[400px] z-50 rounded-md border border-red-800 bg-black shadow-lg">
          <div className="p-4 border-b border-red-800">
            <h3 className="font-semibold text-white text-base">
              Notifications
            </h3>
          </div>

          <ScrollArea className="max-h-[500px] overflow-y-auto">
            <div className="divide-y divide-red-800">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className="px-4 py-3 hover:bg-red-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {notification.text}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              notification.notificationId &&
                              deleteNotification(notification.notificationId)
                            }
                            className="text-xs"
                          >
                            Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              notification.notificationId &&
                              markAsRead(notification.notificationId)
                            }
                            className="text-xs"
                          >
                            Mark
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
