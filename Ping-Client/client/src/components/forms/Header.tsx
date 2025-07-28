"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Settings, LogOut, UserPlus } from "lucide-react";
import NotificationsDropdown from "./NotificationDropdown";
import FriendRequestsDropdown from "./FriendRequestDropdown";
import { apiClient } from "@/sheared/apiClient";
import { getSearchKeyword, getSendFriendRequest } from "@/constants/const";
import { SendFriendRequestResponse } from "@/types/friends/friends";
import { User } from "@/hooks/useUserData";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const handleSearchRequest = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await apiClient<void, User[]>({
        url: getSearchKeyword(searchQuery),
        method: "GET",
      });
      setSearchResults(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setSearchResults([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearchModalOpen(true);
      setTimeout(handleSearchRequest, 100);
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
        setError(null);
        alert("Friend request sent successfully!");
      } else {
        if (response.message !== undefined) setError(response.message);
        else setError("An error occurred while sending the friend request.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCloseModal = () => {
    setIsSearchModalOpen(false);
    setError(null);
    setSearchResults([]);
    setLoading(false);
    setHasSearched(false);
  };

  return (
    <header className="bg-black border-b border-red-800 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-red-700">Ping</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-700 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch().then();
                }}
                className="pl-10 w-64 text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationsDropdown user={user} />
            <FriendRequestsDropdown user={user} />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-700 hover:text-red-800"
            >
              <LogOut className="w-5 h-5" />
            </Button>

            {user?.roles?.includes("ROLE_ADMIN") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("/settings", "_blank")}
                className="text-red-700 hover:text-red-800"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}

            <Avatar className="cursor-pointer border-2 border-red-800">
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
              <AvatarFallback className="bg-red-900 text-white">
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <Dialog
        open={isSearchModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-white">
              Search Results {searchQuery && `for "${searchQuery}"`}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {searchResults.length > 0
                ? `Found ${searchResults.length} user${
                    searchResults.length !== 1 ? "s" : ""
                  }`
                : hasSearched
                ? "No results found"
                : "Search for users by username"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-white">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center space-x-4 p-3 border border-red-800 rounded-lg hover:bg-red-950/20 transition-colors"
                  >
                    <Avatar className="w-12 h-12 border-2 border-red-800 flex-shrink-0">
                      <AvatarImage
                        src={
                          u.profilePicture?.startsWith("http")
                            ? u.profilePicture
                            : u.profilePicture
                            ? `http://localhost:8081/${u.profilePicture}`
                            : undefined
                        }
                        alt={u.username}
                        className="object-contain max-w-full max-h-full"
                      />
                      <AvatarFallback className="bg-red-800 text-white text-sm">
                        {u.username?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {u.username}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {u.firstName} {u.lastName}
                      </p>
                    </div>
                    <div className="w-px h-12 bg-red-800 flex-shrink-0"></div>
                    <Button
                      onClick={() =>
                        u.username && handleSendFriendRequest(u.username)
                      }
                      size="sm"
                      className="flex-shrink-0"
                      disabled={loading}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No users found for "
                  <span className="text-white">{searchQuery}</span>"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    handleSearchRequest().then();
                  }}
                  className="mt-2 text-red-700 hover:text-red-800"
                >
                  Search again
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  Enter a search term and press Enter to find users
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex-shrink-0  text-center mt-4 p-3 text-red-700 rounded border border-red-800">
              <p>{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2 text-red-700 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div className="flex-shrink-0 flex justify-between items-center mt-4 pt-4 border-t border-red-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                handleSearchRequest().then();
              }}
              disabled={loading || !searchQuery.trim()}
              className="text-red-700 hover:text-red-800"
            >
              Search Again
            </Button>
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
