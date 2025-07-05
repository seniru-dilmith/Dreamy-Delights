"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Key, Database, Mail, Save, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdmin, ADMIN_PERMISSIONS } from "@/app/context/AdminContext";
import { InputSanitizer } from "@/utils/encryption";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  permissions: string[];
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  features: {
    onlineOrdering: boolean;
    deliveryService: boolean;
    loyaltyProgram: boolean;
    giftCards: boolean;
  };
}

export default function AdminSettings() {
  const { admin, hasPermission } = useAdmin();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Dreamy Delights",
    siteDescription: "Handcrafted pastries made with love",
    contactEmail: "contact@dreamydelights.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Sweet Street, Bakery Town, BT 12345",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
    businessHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 8:00 PM",
      saturday: "9:00 AM - 8:00 PM",
      sunday: "10:00 AM - 4:00 PM",
    },
    features: {
      onlineOrdering: true,
      deliveryService: true,
      loyaltyProgram: false,
      giftCards: false,
    },
  });

  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Admin form state
  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "editor" as AdminUser["role"],
    permissions: [] as string[],
    active: true,
  });

  useEffect(() => {
    loadAdminUsers();
    loadSiteSettings();
  }, []);

  const loadAdminUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAdmins: AdminUser[] = [
        {
          id: "1",
          username: "superadmin",
          email: "admin@dreamydelights.com",
          role: "super_admin",
          permissions: Object.values(ADMIN_PERMISSIONS),
          active: true,
          lastLogin: "2024-01-21T09:15:00Z",
          createdAt: "2023-12-01T00:00:00Z",
        },
        {
          id: "2",
          username: "manager",
          email: "manager@dreamydelights.com",
          role: "admin",
          permissions: [
            ADMIN_PERMISSIONS.MANAGE_PRODUCTS,
            ADMIN_PERMISSIONS.MANAGE_ORDERS,
            ADMIN_PERMISSIONS.MANAGE_CONTENT,
            ADMIN_PERMISSIONS.VIEW_ANALYTICS,
          ],
          active: true,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];
      setAdminUsers(mockAdmins);
    } catch (error) {
      console.error("Error loading admin users:", error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      // Mock data - replace with actual API call
      // Settings would be loaded from your backend
    } catch (error) {
      console.error("Error loading site settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Sanitize settings data
      const sanitizedSettings = {
        ...siteSettings,
        siteName: InputSanitizer.sanitizeForDatabase(siteSettings.siteName),
        siteDescription: InputSanitizer.sanitizeForDatabase(siteSettings.siteDescription),
        contactEmail: InputSanitizer.sanitizeForDatabase(siteSettings.contactEmail),
        contactPhone: InputSanitizer.sanitizeForDatabase(siteSettings.contactPhone),
        address: InputSanitizer.sanitizeForDatabase(siteSettings.address),
      };

      // Here you would make an API call to save settings
      
      // Show success message
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!adminForm.username || !adminForm.email) {
        alert("Please fill in all required fields");
        return;
      }

      if (!InputSanitizer.validateEmail(adminForm.email)) {
        alert("Please enter a valid email address");
        return;
      }

      if (!editingAdmin && adminForm.password) {
        const passwordValidation = InputSanitizer.validatePassword(adminForm.password);
        if (!passwordValidation.valid) {
          alert(passwordValidation.message);
          return;
        }
      }

      // Sanitize form data
      const sanitizedData = {
        ...adminForm,
        username: InputSanitizer.sanitizeForDatabase(adminForm.username),
        email: InputSanitizer.sanitizeForDatabase(adminForm.email),
      };

      if (editingAdmin) {
        // Update existing admin
        const updatedAdmin = {
          ...editingAdmin,
          ...sanitizedData,
        };
        setAdminUsers(prev => prev.map(a => a.id === editingAdmin.id ? updatedAdmin : a));
      } else {
        // Create new admin
        const newAdmin: AdminUser = {
          id: Date.now().toString(),
          ...sanitizedData,
          createdAt: new Date().toISOString(),
        };
        setAdminUsers(prev => [...prev, newAdmin]);
      }

      resetAdminForm();
      setIsAdminDialogOpen(false);
    } catch (error) {
      console.error("Error saving admin:", error);
      alert("Error saving admin user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = (adminUser: AdminUser) => {
    setEditingAdmin(adminUser);
    setAdminForm({
      username: adminUser.username,
      email: adminUser.email,
      password: "",
      role: adminUser.role,
      permissions: adminUser.permissions,
      active: adminUser.active,
    });
    setIsAdminDialogOpen(true);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin user?")) return;

    try {
      setAdminUsers(prev => prev.filter(a => a.id !== adminId));
      // Here you would make an API call to delete the admin
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const resetAdminForm = () => {
    setAdminForm({
      username: "",
      email: "",
      password: "",
      role: "editor",
      permissions: [],
      active: true,
    });
    setEditingAdmin(null);
  };

  const togglePermission = (permission: string) => {
    setAdminForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getRoleBadge = (role: AdminUser["role"]) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-purple-100 text-purple-800",
      editor: "bg-blue-100 text-blue-800",
    };
    return <Badge className={colors[role]}>{role.replace('_', ' ')}</Badge>;
  };

  if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_SETTINGS)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="admins">Admin Users</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save General Settings"}
                </Button>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={siteSettings.contactPhone}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input
                      id="facebook"
                      placeholder="https://facebook.com/..."
                      value={siteSettings.socialMedia.facebook}
                      onChange={(e) => setSiteSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram URL</Label>
                    <Input
                      id="instagram"
                      placeholder="https://instagram.com/..."
                      value={siteSettings.socialMedia.instagram}
                      onChange={(e) => setSiteSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/..."
                      value={siteSettings.socialMedia.twitter}
                      onChange={(e) => setSiteSettings(prev => ({ 
                        ...prev, 
                        socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Business Hours</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(siteSettings.businessHours).map(([day, hours]) => (
                      <div key={day} className="space-y-2">
                        <Label htmlFor={day} className="capitalize">{day}</Label>
                        <Input
                          id={day}
                          value={hours}
                          onChange={(e) => setSiteSettings(prev => ({ 
                            ...prev, 
                            businessHours: { ...prev.businessHours, [day]: e.target.value }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Contact Settings"}
                </Button>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Website Features</h4>
                  
                  {Object.entries(siteSettings.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h5 className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1')}</h5>
                        <p className="text-sm text-gray-600">
                          {feature === 'onlineOrdering' && "Allow customers to place orders online"}
                          {feature === 'deliveryService' && "Offer delivery service to customers"}
                          {feature === 'loyaltyProgram' && "Enable customer loyalty program"}
                          {feature === 'giftCards' && "Sell digital gift cards"}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => setSiteSettings(prev => ({ 
                          ...prev, 
                          features: { ...prev.features, [feature]: checked }
                        }))}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Feature Settings"}
                </Button>
              </TabsContent>

              <TabsContent value="admins" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Admin Users</h4>
                  {hasPermission(ADMIN_PERMISSIONS.MANAGE_ADMINS) && (
                    <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetAdminForm}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingAdmin ? "Edit Admin User" : "Add New Admin User"}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <Input
                                id="username"
                                value={adminForm.username}
                                onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={adminForm.email}
                                onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password">
                              {editingAdmin ? "New Password (leave blank to keep current)" : "Password"}
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={adminForm.password}
                              onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                              required={!editingAdmin}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={adminForm.role} onValueChange={(value) => setAdminForm(prev => ({ ...prev, role: value as AdminUser["role"] }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                {admin?.role === "super_admin" && (
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(ADMIN_PERMISSIONS).map(([key, permission]) => (
                                <label key={permission} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={adminForm.permissions.includes(permission)}
                                    onChange={() => togglePermission(permission)}
                                  />
                                  <span className="text-sm">{key.replace(/_/g, ' ')}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={adminForm.active}
                              onCheckedChange={(checked) => setAdminForm(prev => ({ ...prev, active: checked }))}
                            />
                            <Label>Active</Label>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Saving..." : editingAdmin ? "Update" : "Create"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map(adminUser => (
                        <TableRow key={adminUser.id}>
                          <TableCell className="font-medium">{adminUser.username}</TableCell>
                          <TableCell>{adminUser.email}</TableCell>
                          <TableCell>{getRoleBadge(adminUser.role)}</TableCell>
                          <TableCell>
                            <Badge className={adminUser.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {adminUser.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {adminUser.lastLogin ? new Date(adminUser.lastLogin).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell>
                            {hasPermission(ADMIN_PERMISSIONS.MANAGE_ADMINS) && adminUser.id !== admin?.id && (
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditAdmin(adminUser)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteAdmin(adminUser.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
