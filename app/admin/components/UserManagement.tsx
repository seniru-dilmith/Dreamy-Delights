"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Mail, Shield, Ban, Eye, Loader2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminFetchUsers, adminUpdateUserStatus, adminUpdateUserRole } from "@/firebase/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "editor" | "vip_customer" | string;
  status: "active" | "banned" | string;
  joinDate: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  emailVerified?: boolean;
  providerId?: string[];
  photoURL?: string;
  phoneNumber?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingStatusChanges, setPendingStatusChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetchUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        console.error("Failed to load users:", response.message);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      // Optimistically update the UI
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
      
      // Remove from pending changes
      setPendingStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      
      // Make API call to update user status
      const response = await adminUpdateUserStatus(userId, newStatus);
      if (!response.success) {
        // Revert if failed
        loadUsers();
        console.error("Failed to update user status:", response.message);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      // Revert on error
      loadUsers();
    }
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    // Add to pending changes instead of immediately updating
    setPendingStatusChanges(prev => ({
      ...prev,
      [userId]: newStatus
    }));
  };

  const confirmStatusChange = (userId: string) => {
    const newStatus = pendingStatusChanges[userId];
    if (newStatus) {
      updateUserStatus(userId, newStatus);
    }
  };

  const cancelStatusChange = (userId: string) => {
    setPendingStatusChanges(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Optimistically update the UI
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      // Make API call to update user role
      const response = await adminUpdateUserRole(userId, newRole);
      if (!response.success) {
        // Revert if failed
        loadUsers();
        console.error("Failed to update user role:", response.message);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      // Revert on error
      loadUsers();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      active: { label: "Active", color: "bg-green-100 text-green-800" },
      banned: { label: "Banned", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || { label: status || "Unknown", color: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      customer: { label: "Customer", color: "bg-blue-100 text-blue-800" },
      admin: { label: "Admin", color: "bg-purple-100 text-purple-800" },
      editor: { label: "Editor", color: "bg-orange-100 text-orange-800" },
      vip_customer: { label: "VIP Customer", color: "bg-yellow-100 text-yellow-800" },
    };

    const config = roleConfig[role] || { label: role || "Unknown", color: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const customers = users.filter(u => u.role === "customer").length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold">{customers}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 text-gray-400">Rs.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div className="flex space-x-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="editor">Editors</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(user.joinDate)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(user.lastLogin)}
                          </TableCell>
                          <TableCell>{user.totalOrders}</TableCell>
                          <TableCell>Rs. {user.totalSpent.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-1">
                                <Select
                                  value={pendingStatusChanges[user.id] || user.status}
                                  onValueChange={(value) => handleStatusChange(user.id, value)}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {pendingStatusChanges[user.id] && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      onClick={() => confirmStatusChange(user.id)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => cancelStatusChange(user.id)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>

                              {user.role !== "customer" && (
                                <Select
                                  value={user.role}
                                  onValueChange={(value) => updateUserRole(user.id, value as User["role"])}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}

                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    No users found for the selected filters.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
