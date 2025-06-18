"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "../context/CartContext"

export default function CartPage() {
  const { cartItems, total, updateQuantity, removeFromCart, clearCart } = useCart()

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
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          {item.customizations && (
                            <div className="text-sm text-gray-600 mt-1">
                              {item.customizations.size && `Size: ${item.customizations.size}`}
                              {item.customizations.flavor && ` • Flavor: ${item.customizations.flavor}`}
                              {item.customizations.decoration && ` • Decoration: ${item.customizations.decoration}`}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
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

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button asChild variant="outline">
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
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(total * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>$5.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${(total + total * 0.08 + 5).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-pink-500 hover:bg-pink-600" size="lg">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Free delivery on orders over $50</p>
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
