"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, UserMinus, Shield, ShieldOff } from "lucide-react";
import { User } from "@/hooks/useUserData";
import { apiClient } from "@/sheared/apiClient";
import {
  adminAssignRole,
  adminCreateRole,
  adminDeleteRole,
  adminFirstName,
  adminGetAll,
  adminLastName,
  adminPhone,
  adminUnassignRole,
  deleteUser,
} from "@/constants/const";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("lastName");
  const [roleToManage, setRoleToManage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const endpoint =
        searchType === "phone"
          ? adminPhone(searchTerm)
          : searchType === "lastName"
          ? adminLastName(searchTerm)
          : adminFirstName(searchTerm);

      const response = await apiClient<void, User[]>({
        url: endpoint,
        method: "GET",
      });
      setUsers(Array.isArray(response) ? response : [response]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const data: User[] = await apiClient({
        url: adminGetAll(),
        method: "GET",
      });
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) return;
    try {
      await apiClient({ url: deleteUser(username), method: "DELETE" });
      setUsers(users.filter((user) => user.username !== username));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createRole = async (roleType: string) => {
    try {
      await apiClient({ url: adminCreateRole(roleType), method: "POST" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteRole = async (roleType: string) => {
    if (!confirm(`Are you sure you want to delete role ${roleType}?`)) return;
    try {
      await apiClient({ url: adminDeleteRole(roleType), method: "DELETE" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const assignRole = async (username: string, role: string) => {
    try {
      await apiClient({
        url: adminAssignRole(username, role),
        method: "PATCH",
      });
      getAllUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeRole = async (username: string, role: string) => {
    try {
      await apiClient({
        url: adminUnassignRole(username, role),
        method: "PATCH",
      });
      getAllUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={getAllUsers} disabled={loading}>
          {loading ? "Loading..." : "Refresh Users"}
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Users</CardTitle>
              <CardDescription>
                Search for users by different criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="search">Search Term</Label>
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter search term..."
                      onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48 space-y-4">
                  <div>
                    <Label htmlFor="searchType">Search By</Label>
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastName">Last Name</SelectItem>
                        <SelectItem value="firstName">First Name</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={searchUsers}
                    disabled={loading || !searchTerm.trim()}
                    className="bg-red-700 text-white"
                  >
                    Search
                  </Button>
                </div>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={roleToManage} onValueChange={setRoleToManage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROLE_ADMIN">ROLE_ADMIN</SelectItem>
                    <SelectItem value="ROLE_USER">ROLE_USER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {user.bio}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user?.roles?.map((role) => (
                            <Badge
                              key={role}
                              variant={
                                role.includes("ADMIN")
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              assignRole(user?.username!, roleToManage)
                            }
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              removeRole(user?.username!, roleToManage)
                            }
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteUser(user.username!)}
                            className="bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Click "Refresh Users" to load all users.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Manage Roles
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. ROLE_ADMIN"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => createRole(roleName)}
                  className="w-full sm:w-auto"
                  disabled={!roleName.trim()}
                >
                  Create Role
                </Button>

                <Button
                  onClick={() => deleteRole(roleName)}
                  className="w-full sm:w-auto bg-red-700 text-white"
                  disabled={!roleName.trim()}
                >
                  Delete Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );
}
