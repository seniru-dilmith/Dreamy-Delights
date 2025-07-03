"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  LogOut,
  Image,
  FileText,
  Eye,
  BarChart3,
  Shield,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin, ADMIN_PERMISSIONS } from "@/app/context/AdminContext";
import { fetchDashboardStats } from "@/firebase/api";
import ProductManagement from "@/app/admin/components/ProductManagement";
import OrderManagement from "@/app/admin/components/OrderManagement";
import ContentManagement from "@/app/admin/components/ContentManagement";
import UserManagement from "@/app/admin/components/UserManagement";
import TestimonialManagement from "@/app/admin/components/TestimonialManagement";
import TestimonialDebugPanel from "@/app/admin/components/TestimonialDebugPanel";
import AnalyticsDashboard from "@/app/admin/components/AnalyticsDashboard";
import AdminSettings from "@/app/admin/components/AdminSettings";
import AdminDebugPanel from "@/app/admin/components/AdminDebugPanel";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export default function AdminDashboard() {
  const { admin, logout, hasPermission, loading } = useAdmin();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
    }
  }, [admin, loading, router]);

  // Load dashboard stats
  useEffect(() => {
    if (admin) {
      loadDashboardStats();
    }
  }, [admin]);

  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetchDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        console.warn("Dashboard stats API unavailable, using fallback data:", response.message);
        // Use fallback data from the API response
        if (response.data) {
          setStats(response.data);
        } else {
          // Final fallback if no data at all
          setStats({
            totalProducts: 0,
            totalOrders: 0,
            totalUsers: 0,
            totalRevenue: 0,
            recentOrders: 0,
            pendingOrders: 0,
            averageOrderValue: 0
          });
        }
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      // Final fallback for any unexpected errors
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: 0,
        pendingOrders: 0,
        averageOrderValue: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect in useEffect
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3, permission: null },
    { id: "products", label: "Products", icon: Package, permission: ADMIN_PERMISSIONS.MANAGE_PRODUCTS },
    { id: "orders", label: "Orders", icon: ShoppingCart, permission: ADMIN_PERMISSIONS.MANAGE_ORDERS },
    { id: "users", label: "Users", icon: Users, permission: ADMIN_PERMISSIONS.MANAGE_USERS },
    { id: "content", label: "Content", icon: FileText, permission: ADMIN_PERMISSIONS.MANAGE_CONTENT },
    { id: "testimonials", label: "Testimonials", icon: Star, permission: ADMIN_PERMISSIONS.MANAGE_TESTIMONIALS },
    { id: "analytics", label: "Analytics", icon: TrendingUp, permission: ADMIN_PERMISSIONS.VIEW_ANALYTICS },
    { id: "settings", label: "Settings", icon: Settings, permission: ADMIN_PERMISSIONS.MANAGE_SETTINGS },
    { id: "debug", label: "Debug", icon: Eye, permission: ADMIN_PERMISSIONS.DEBUG },
  ].filter(tab => !tab.permission || hasPermission(tab.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Dreamy Delights</p>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation - Two Rows Layout */}
          <TabsList className="h-auto bg-white p-3 rounded-lg shadow-sm grid grid-cols-1 gap-2">
            {/* First Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {tabs.slice(0, Math.ceil(tabs.length / 2)).map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center justify-center space-x-2 p-3 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 hover:bg-gray-50 transition-colors min-h-[3rem]"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </div>
            {/* Second Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {tabs.slice(Math.ceil(tabs.length / 2)).map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center justify-center space-x-2 p-3 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 hover:bg-gray-50 transition-colors min-h-[3rem]"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </div>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        stats.totalProducts
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Active products</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        stats.totalOrders
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isLoadingStats ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-4 w-20 rounded"></span>
                      ) : (
                        `${stats.pendingOrders} pending`
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                      ) : (
                        stats.totalUsers
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Registered customers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                      ) : (
                        `Rs. ${stats.totalRevenue.toLocaleString()}`
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isLoadingStats ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-4 w-24 rounded"></span>
                      ) : (
                        `Avg: Rs. ${stats.averageOrderValue}`
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hasPermission(ADMIN_PERMISSIONS.MANAGE_PRODUCTS) && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("products")}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Package className="w-6 h-6" />
                      <span>Manage Products</span>
                    </Button>
                  )}
                  
                  {hasPermission(ADMIN_PERMISSIONS.MANAGE_ORDERS) && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("orders")}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      <span>View Orders</span>
                    </Button>
                  )}
                  
                  {hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT) && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("content")}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Image className="w-6 h-6" />
                      <span>Manage Content</span>
                    </Button>
                  )}

                  {hasPermission(ADMIN_PERMISSIONS.MANAGE_TESTIMONIALS) && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("testimonials")}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <Star className="w-6 h-6" />
                      <span>Testimonials</span>
                    </Button>
                  )}
                  
                  {hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS) && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("analytics")}
                      className="h-20 flex flex-col space-y-2"
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span>View Analytics</span>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Featured Products Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Featured Products</span>
                    <Badge variant="secondary">Manage</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4">
                    Featured products are displayed prominently on your homepage and help drive sales.
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab("products");
                        // This will be handled by the ProductManagement component
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Manage Featured</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="debug">
            <div className="space-y-6">
              <AdminDebugPanel />
              <TestimonialDebugPanel />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
