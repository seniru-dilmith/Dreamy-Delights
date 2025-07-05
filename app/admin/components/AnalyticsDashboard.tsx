"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminFetchAnalytics } from "@/firebase/api";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  customersByMonth: Array<{
    month: string;
    newCustomers: number;
    totalCustomers: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    topProducts: [],
    salesByMonth: [],
    customersByMonth: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetchAnalytics();
      if (response.success) {
        setAnalyticsData(response.data || {
          totalRevenue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          orderGrowth: 0,
          customerGrowth: 0,
          topProducts: [],
          salesByMonth: [],
          customersByMonth: [],
        });
      } else {
        console.error("Failed to load analytics:", response.message);
        // Set default empty state
        setAnalyticsData({
          totalRevenue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          orderGrowth: 0,
          customerGrowth: 0,
          topProducts: [],
          salesByMonth: [],
          customersByMonth: [],
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Set default empty state on error
      setAnalyticsData({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
        customerGrowth: 0,
        topProducts: [],
        salesByMonth: [],
        customersByMonth: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return '0.0%';
    }
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Filter and period selection */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className={analyticsData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(analyticsData.revenueGrowth)}
                </span>{' '}
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className={analyticsData.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(analyticsData.orderGrowth)}
                </span>{' '}
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                <span className={analyticsData.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(analyticsData.customerGrowth)}
                </span>{' '}
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sales Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add your chart component here */}
              <div className="h-[300px] flex items-center justify-center bg-gray-50">
                {/* This is where your chart would go */}
                <p className="text-gray-500">Sales chart visualization</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.customersByMonth && analyticsData.customersByMonth.length > 0 ? (
                  analyticsData.customersByMonth.map((data, index) => (
                    <div key={data.month || `month-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="font-medium">{data.month || `Month ${index + 1}`}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{data.totalCustomers || 0} total</div>
                        <div className="text-sm text-gray-600">+{data.newCustomers || 0} new</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No customer data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts && analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((product, index) => (
                  <div key={product.id || `product-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name || 'Unknown Product'}</h4>
                        <p className="text-sm text-gray-600">{product.sales || 0} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(product.revenue || 0)}</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No product data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add your additional insight cards here */}
        </div>
      </motion.div>
    </div>
  );
}
