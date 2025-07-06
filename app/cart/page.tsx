"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"

import { calculateOrderTotals, getDeliveryMessage } from "@/utils/businessConfig"

export default function CartPage() {
  const { cartItems, total, loading, error, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  // Calculate totals using utility function
  const { taxAmount, deliveryFee, finalTotal } = calculateOrderTotals(total)

  const handleCheckout = () => {
    // Allow guest users to proceed to checkout, they'll be prompted to login there
    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious treats to get started!</p>
          <Button asChild className="bg-pink-500 hover:bg-pink-600">
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Shopping Cart</h1>
          <p className="text-sm md:text-base text-gray-600">Review your items and proceed to checkout</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-3 md:space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <Image
                          src={item.image || "/logo-large.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-center sm:text-left">{item.name}</h3>
                          {item.customizations && (
                            <div className="text-xs md:text-sm text-gray-600 mt-1 text-center sm:text-left">
                              {item.customizations.size && `Size: ${item.customizations.size}`}
                              {item.customizations.flavor && ` • Flavor: ${item.customizations.flavor}`}
                              {item.customizations.decoration && ` • Decoration: ${item.customizations.decoration}`}
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 md:mt-4 space-y-3 sm:space-y-0">
                            <div className="flex items-center justify-center sm:justify-start space-x-1 md:space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                disabled={loading}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm md:text-base font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={loading}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end space-x-3 md:space-x-4">
                              <span className="text-base md:text-lg font-semibold">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <Button variant="outline" onClick={clearCart} disabled={loading} className="w-full sm:w-auto">
                Clear Cart
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/menu">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="lg:sticky lg:top-24">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-2 mb-4 text-sm md:text-base">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>Rs. {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>Rs. {deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-base md:text-lg">
                        <span>Total</span>
                        <span>Rs. {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-pink-500 hover:bg-pink-600 h-12 text-base font-semibold" 
                    disabled={loading}
                  >
                    Proceed to Checkout
                  </Button>

                  {!user && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs md:text-sm text-blue-800 text-center">
                        <Lock className="h-4 w-4 inline mr-1" />
                        You&rsquo;ll be prompted to sign in before completing your order.
                        <Link 
                          href={`/auth/register?redirect=${encodeURIComponent("/checkout")}`}
                          className="text-blue-600 hover:text-blue-800 underline ml-1 block sm:inline mt-1 sm:mt-0"
                        >
                          New customer? Create an account
                        </Link>
                      </p>
                    </div>
                  )}

                  <div className="mt-4 text-center text-xs md:text-sm text-gray-600">
                    <p>{getDeliveryMessage()}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
