"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { submitContactMessage } from "@/firebase/api"
import { getDeliveryFAQAnswer } from "@/utils/businessConfig"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await submitContactMessage({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })

      // Show success dialog
      setShowSuccessDialog(true)

      toast({
        title: "🌟 Message Received!",
        description: "Thank you for reaching out to Dreamy Delights! We've received your message and our team will get back to you within 24 hours. We appreciate your interest in our sweet creations!",
        duration: 6000,
      })

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting contact message:', error)
      toast({
        title: "Failed to Send Message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-64 md:h-96 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-gray-900 px-4 max-w-full"
        >
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent break-words">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you! Get in touch with any questions or to place a custom order.
          </p>
        </motion.div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 md:py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-lg md:text-xl text-gray-600">We're here to help make your sweet dreams come true</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
            {[
              {
                icon: <MapPin className="h-8 w-8 text-pink-500" />,
                title: "Visit Us",
                details: "Horana, Sri Lanka",
                subtitle: "Come and get served"
              },
              {
                icon: <Phone className="h-8 w-8 text-pink-500" />,
                title: "Call Us",
                details: "(070) 630 9127",
                subtitle: "Mon-Sun 7:00 AM - 9:00 PM"
              },
              {
                icon: <Mail className="h-8 w-8 text-pink-500" />,
                title: "Email Us",
                details: "sansilunikethma@gmail.com",
                subtitle: "We'll respond within 24 hours"
              },
              {
                icon: <Clock className="h-8 w-8 text-pink-500" />,
                title: "Business Hours",
                details: "Mon-Fri: 7:00 AM-8:00 PM",
                subtitle: "Sat-Sun: 8:00 AM-9:00 PM"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-4 md:p-6 text-center hover:shadow-xl transition-shadow duration-300 h-full w-full">
                  <div className="flex justify-center mb-3 md:mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 break-words">{item.title}</h3>
                  <p className="text-gray-700 font-medium mb-1 text-sm md:text-base break-words">{item.details}</p>
                  <p className="text-gray-500 text-xs md:text-sm break-words">{item.subtitle}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 w-full">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full min-w-0"
            >
              <Card className="p-4 md:p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 break-words">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="w-full min-w-0">
                      <Label htmlFor="firstName" className="text-gray-700">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="mt-1 w-full"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="w-full min-w-0">
                      <Label htmlFor="lastName" className="text-gray-700">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="mt-1 w-full"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full min-w-0">
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="mt-1 w-full"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="w-full min-w-0">
                    <Label htmlFor="phone" className="text-gray-700">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(070) 123 4567"
                      className="mt-1 w-full"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="w-full min-w-0">
                    <Label htmlFor="subject" className="text-gray-700">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Custom cake order"
                      className="mt-1 w-full"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="w-full min-w-0">
                    <Label htmlFor="message" className="text-gray-700">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your order or inquiry..."
                      className="mt-1 min-h-32 w-full resize-none"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-pink-500 hover:bg-pink-600 h-12"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 md:space-y-8 w-full min-w-0"
            >
              {/* Map Placeholder */}
              <Card className="p-4 md:p-6 w-full">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 break-words">Find Us</h3>
                <div className="bg-gray-200 h-48 md:h-64 rounded-lg flex items-center justify-center mb-3 md:mb-4 w-full">
                  <div className="text-center text-gray-600">
                    <MapPin className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2" />
                    <p className="text-sm md:text-base">Interactive Map</p>
                    <p className="text-xs md:text-sm">Horana, Sri Lanka</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm md:text-base break-words">
                  Located in the heart of Horana, our bakery is easily accessible and surrounded by ample parking.
                </p>
              </Card>

              {/* FAQ */}
              <Card className="p-4 md:p-6 w-full">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 break-words">Frequently Asked Questions</h3>
                <div className="space-y-3 md:space-y-4 w-full">
                  <div className="w-full">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base break-words">How far in advance should I order?</h4>
                    <p className="text-gray-600 text-xs md:text-sm break-words">We recommend ordering custom cakes at least 48 hours in advance. For special occasions, 1 week notice is preferred.</p>
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base break-words">Do you deliver?</h4>
                    <p className="text-gray-600 text-xs md:text-sm break-words">
                      {getDeliveryFAQAnswer()}
                    </p>
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base break-words">Can I customize my order?</h4>
                    <p className="text-gray-600 text-xs md:text-sm break-words">Absolutely! We love creating custom designs, flavors, and decorations to make your treats perfect for any occasion.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 break-words">Ready to Order Something Sweet?</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 break-words">
              Don't wait! Browse our delicious menu and place your order today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
              <Button asChild size="lg" variant="secondary" className="h-12 w-full sm:w-auto min-w-0">
                <a href="/menu" className="truncate">
                  Browse Our Menu
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white hover:bg-white text-purple-600 h-12 w-full sm:w-auto min-w-0"
              >
                <a href="tel:0706309127" className="truncate">Call Now</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900">
              Thank You for Reaching Out! 🌟
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-4 leading-relaxed">
              We've successfully received your message and truly appreciate you taking the time to contact Dreamy Delights. 
              <br /><br />
              Our dedicated team will carefully review your inquiry and get back to you within 24 hours. We're excited to help make your sweet dreams come true!
              <br /><br />
              <span className="text-sm font-medium text-purple-600">
                Keep an eye on your inbox for our response! 📧
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-2"
            >
              Perfect! 
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
