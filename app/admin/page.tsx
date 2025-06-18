"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Package, Users, ShoppingCart, TrendingUp, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../context/AuthContext"

const mockStats = {
  totalOrders: 156,
  totalCustomers: 89,
  totalProducts: 24,
  revenue: 12450,
}

const mockOrders = [
  { id: "001", customer: "Sarah Johnson", items: 3, total: 45.99, status: "pending" },
  { id: "002", customer: "Mike Chen", items: 1, total: 25.99, status: "completed" },
  { id: "003", customer: "Emily Davis", items: 2, total: 35.5, status: "processing" },
]

const mockProducts = [
  { id: "1", name: "Chocolate Cupcake", price: 4.99, stock: 24, category: "Cupcakes" },
  { id: "2", name: "Vanilla Cake", price: 45.99, stock: 5, category: "Cakes" },
  { id: "3", name: "Red Velvet", price: 5.99, stock: 18, category: "Cupcakes" },
]

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth/login")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return <div>Access denied</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your bakery operations</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {["dashboard", "orders", "products", "customers"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-3xl font-bold">{mockStats.totalOrders}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-pink-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Customers</p>
                        <p className="text-3xl font-bold">{mockStats.totalCustomers}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Products</p>
                        <p className="text-3xl font-bold">{mockStats.totalProducts}</p>
                      </div>
                      <Package className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold">${mockStats.revenue}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total}</p>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {order.customer} • {order.items} items
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-semibold">${order.total}</p>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Management</CardTitle>
              <Button className="bg-pink-500 hover:bg-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.category} • Stock: {product.stock}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-semibold">${product.price}</p>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Customer management features coming soon...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
