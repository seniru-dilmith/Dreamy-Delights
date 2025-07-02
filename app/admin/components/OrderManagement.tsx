"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, User, Calendar, Eye, X, Check, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminFetchOrders, adminUpdateOrderStatus } from "@/firebase/api";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: any[];
}

interface Order {
  id: string;
  orderId: string;
  orderNumber: number;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerInfo?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  orderDate?: string | Date | any; // Can be Firestore Timestamp
  createdAt?: string | Date | any; // Can be Firestore Timestamp
  updatedAt?: string | Date | any; // Can be Firestore Timestamp
  deliveryDate?: string | Date | any;
  notes?: string;
  additionalNotes?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  contactPhone?: string;
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "preparing", label: "Preparing", color: "bg-purple-100 text-purple-800" },
  { value: "ready", label: "Ready", color: "bg-green-100 text-green-800" },
  { value: "delivered", label: "Delivered", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pendingStatusChanges, setPendingStatusChanges] = useState<{[orderId: string]: Order["status"]}>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<{[orderId: string]: boolean}>({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetchOrders();
      if (response.success) {
        console.log('Loaded orders sample:', response.data?.[0]); // Debug: log first order
        setOrders(response.data || []);
      } else {
        console.error("Failed to load orders:", response.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setIsUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await adminUpdateOrderStatus(orderId, newStatus);
      if (response.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        // Clear pending change
        setPendingStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      } else {
        console.error("Failed to update order status:", response.message);
        alert(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("An error occurred while updating the order status");
    } finally {
      setIsUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setPendingStatusChanges(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const saveStatusChange = (orderId: string) => {
    const newStatus = pendingStatusChanges[orderId];
    if (newStatus) {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const cancelStatusChange = (orderId: string) => {
    setPendingStatusChanges(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === "all" || order.status === filterStatus
  );

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp objects with seconds and nanoseconds
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds !== undefined) {
        date = new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
      }
      // Handle Firestore Timestamp with toDate method
      else if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      // Handle _seconds property (sometimes Firestore timestamps have this)
      else if (dateValue && typeof dateValue === 'object' && dateValue._seconds !== undefined) {
        date = new Date(dateValue._seconds * 1000);
      }
      // Handle ISO string dates
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle numeric timestamps (milliseconds)
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      else {
        console.log('Unknown date format:', dateValue);
        return 'Unknown format';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date after parsing:', dateValue);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Format Error';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Management</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {ORDER_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          
          <CardContent>
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {ORDER_STATUSES.slice(0, 4).map(status => {
                const count = orders.filter(order => order.status === status.value).length;
                return (
                  <Card key={status.value}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{status.label}</p>
                          <p className="text-2xl font-bold">{count}</p>
                        </div>
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Orders Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date & Time</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderId || order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerInfo?.name || order.customerName || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{order.customerInfo?.email || order.customerEmail || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{order.contactPhone || order.shippingAddress?.phone || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={`${order.id}-item-${index}`} className="text-sm">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        Rs. {order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(order.orderDate || order.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.shippingAddress?.state || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate">
                            {order.additionalNotes || order.notes || 'No notes'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Select
                              value={pendingStatusChanges[order.id] || order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                              disabled={isUpdatingStatus[order.id]}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUSES.map(status => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Save/Cancel buttons - show only when there's a pending change */}
                          {pendingStatusChanges[order.id] && pendingStatusChanges[order.id] !== order.status && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => saveStatusChange(order.id)}
                                disabled={isUpdatingStatus[order.id]}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-7"
                              >
                                {isUpdatingStatus[order.id] ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelStatusChange(order.id)}
                                disabled={isUpdatingStatus[order.id]}
                                className="px-2 py-1 h-7"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found for the selected filter.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Order Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderId || selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{selectedOrder.customerInfo?.name || selectedOrder.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedOrder.customerInfo?.email || selectedOrder.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                    <p>{selectedOrder.contactPhone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p>{selectedOrder.shippingAddress.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p>{selectedOrder.shippingAddress.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">City, State</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ZIP Code</p>
                        <p>{selectedOrder.shippingAddress.zipCode}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">No shipping address available</p>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={`detail-${selectedOrder.id}-item-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-xs text-gray-500">Customizations: {item.customizations.join(', ')}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">@ Rs. {item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        <span>Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status & Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Status & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Date & Time</p>
                    <p>{formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</p>
                  </div>
                  {selectedOrder.updatedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p>{formatDate(selectedOrder.updatedAt)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Number</p>
                    <p>{selectedOrder.orderNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Delivery State</p>
                    <p>{selectedOrder.shippingAddress?.state || 'Not specified'}</p>
                  </div>
                  {(selectedOrder.additionalNotes || selectedOrder.notes) && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                      <p className="bg-gray-50 p-3 rounded text-sm">
                        {selectedOrder.additionalNotes || selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
