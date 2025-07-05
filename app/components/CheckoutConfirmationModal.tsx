"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CheckoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { phone: string; notes: string }) => void
  isSubmitting: boolean
  total: number
  error?: string
}

export default function CheckoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  total,
  error
}: CheckoutConfirmationModalProps) {
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState({ phone: "", notes: "" })

  const validateForm = () => {
    const newErrors = { phone: "", notes: "" }
    
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }
    
    setErrors(newErrors)
    return !newErrors.phone && !newErrors.notes
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onConfirm({ phone: phone.trim(), notes: notes.trim() })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setPhone("")
      setNotes("")
      setErrors({ phone: "", notes: "" })
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Confirm Your Order</h2>
                <p className="text-sm text-gray-600 mt-1">Total: Rs. {total.toFixed(2)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Our admin will call you</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Our team will contact you within 24 hours to confirm your order details, finalize pricing including delivery charges, and arrange delivery.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Contact Phone Number *</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                    disabled={isSubmitting}
                    required
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Additional Notes (Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions, delivery preferences, or other notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Let us know about any specific delivery instructions, dietary requirements, or special requests.
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Order"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
