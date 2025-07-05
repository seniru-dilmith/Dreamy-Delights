"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { createOrder } from "@/firebase/api"
import { calculateOrderTotals } from "@/utils/businessConfig"
import CheckoutConfirmationModal from "../components/CheckoutConfirmationModal"

export default function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Customer Info
    fullName: "",
    email: "",
    phone: "",
    
    // Shipping Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })

  useEffect(() => {
    // Redirect to cart if no items
    if (cartItems.length === 0 && !orderSuccess) {
      router.push("/cart")
    }
    
    // Check if user needs to log in when they first arrive at checkout
    if (!user && !orderSuccess && cartItems.length > 0) {
      setShowLoginPrompt(true)
    }
  }, [cartItems, user, router, orderSuccess])

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || user.email?.split('@')[0] || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    // Clear any previous errors and show confirmation modal
    setError("")
    setShowConfirmationModal(true)
  }

  const handleLoginRedirect = () => {
    router.push("/auth/login?redirect=" + encodeURIComponent("/checkout"))
  }

  const handleConfirmOrder = async (contactData: { phone: string; notes: string }) => {
    setIsSubmitting(true)
    setError("")

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations
        })),
        totalAmount: finalTotal, // Include tax and delivery in the total
        subtotal: total,
        taxAmount: taxAmount,
        deliveryFee: deliveryFee,
        shippingAddress: {
          name: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: contactData.phone // Use phone from modal
        },
        contactPhone: contactData.phone,
        additionalNotes: contactData.notes,
        customerInfo: {
          email: formData.email,
          name: formData.fullName
        }
      }

      const result = await createOrder(orderData) as { success: boolean; orderId: string; message: string }
      
      if (result.success) {
        setOrderId(result.orderId)
        setOrderSuccess(true)
        setShowConfirmationModal(false)
        clearCart()
      } else {
        setError(result.message || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your order. Your order ID is: <strong>#{orderId}</strong>
          </p>
          <p className="text-gray-600 mb-8">
            We'll send you an email confirmation shortly and keep you updated on your order status.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full bg-pink-500 hover:bg-pink-600">
              <a href="/menu">Order Again</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate totals using utility function
  const { subtotal, taxAmount, deliveryFee, taxPercentage, finalTotal } = calculateOrderTotals(total)

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600">Complete your order details</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Form */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({(taxPercentage * 100).toFixed(1)}%)</span>
                        <span>Rs. {taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>Rs. {deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>Rs. {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {taxAmount === 0 && deliveryFee === 0 
                        ? 'No additional charges applied.' 
                        : 'Final pricing including all charges will be confirmed during the phone call.'
                      }
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-pink-500 hover:bg-pink-600 mt-6" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    Place Order
                  </Button>

                  <p className="text-xs text-gray-600 text-center mt-4">
                    By placing this order, you agree to our terms and conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Checkout Confirmation Modal */}
        <CheckoutConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false)
            setError("")
          }}
          onConfirm={handleConfirmOrder}
          isSubmitting={isSubmitting}
          total={finalTotal}
          error={error}
        />

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-600 mb-6">
                  You need to log in to complete your order. Don't worry, your cart items are saved!
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleLoginRedirect} 
                    className="w-full bg-pink-500 hover:bg-pink-600"
                  >
                    Login to Continue
                  </Button>
                  <Button 
                    onClick={() => setShowLoginPrompt(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
