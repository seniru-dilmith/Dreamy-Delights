"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { FaAward, FaUsers, FaClock, FaHeart, FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa"
import { Card, CardContent } from "@/components/ui/card"

const owner = {
  name: "Kethma Sansiluni",
  role: "Meet the Magical Baker",
  bio: "Kethma founded Dreamy Delights to share her passion for creating beautiful, delicious treats. She personally oversees every aspect of the bakery to ensure the highest quality and customer satisfaction.",
  socialMedia: [
    { platform: "Instagram", icon: FaInstagram, url: "https://www.instagram.com/dreamy_dels/", handle: "@dreamy_dels" },
    { platform: "Facebook", icon: FaFacebookF, url: "https://www.facebook.com/dreamydels", handle: "Dreamy Delights" },
    { platform: "WhatsApp", icon: FaWhatsapp, url: "https://wa.me/message/G54ADT3RXJYXF1", handle: "Dreamy Delights" },
  ]
}

const values = [
  {
    icon: FaHeart,
    title: "Made with Love",
    description: "Every item is crafted with care and attention to detail",
  },
  {
    icon: FaAward,
    title: "Quality Ingredients",
    description: "We use only the finest, freshest ingredients available",
  },
  {
    icon: FaUsers,
    title: "Community Focused",
    description: "Supporting our local community through partnerships and events",
  },
  {
    icon: FaClock,
    title: "Fresh Daily",
    description: "All products are baked fresh daily for optimal taste and quality",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-8 md:pb-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 break-words">Our Sweet Story</h1>
              <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
                Dreamy Delights began as a small home bakery with a big dream: to create the most
                delicious and beautiful baked goods that bring joy to every celebration.
              </p>
              <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 leading-relaxed">
                What started in the kitchen has grown into a beloved local bakery, but our commitment to quality,
                creativity, and customer satisfaction remains unchanged.
              </p>
              <div className="flex items-center justify-between sm:justify-start sm:space-x-6 md:space-x-8 max-w-sm mx-auto md:mx-0">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-pink-600">100%</div>
                  <div className="text-xs md:text-sm text-gray-600">Fresh Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-pink-600">50+</div>
                  <div className="text-xs md:text-sm text-gray-600">Orders Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-pink-600">24/7</div>
                  <div className="text-xs md:text-sm text-gray-600">Online Orders</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative order-1 md:order-2"
            >
              <Image
                src="/logo-large.png"
                alt="Bakery Interior"
                width={600}
                height={500}
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words">Our Values</h2>
            <p className="text-lg md:text-xl text-gray-600 break-words">What makes Dreamy Delights special</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-full"
              >
                <Card className="text-center p-4 md:p-6 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-4 md:pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-pink-100 rounded-full mb-3 md:mb-4">
                      <value.icon className="h-6 w-6 md:h-8 md:w-8 text-pink-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 break-words">{value.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base break-words">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words">Meet the Owner</h2>
            <p className="text-lg md:text-xl text-gray-600 break-words">The passionate baker behind Dreamy Delights</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 md:p-8 text-center">
                <h3 className="text-2xl md:text-3xl font-semibold mb-2 break-words">{owner.name}</h3>
                <p className="text-pink-600 font-medium mb-4 md:mb-6 text-lg md:text-xl break-words">{owner.role}</p>
                <p className="text-gray-600 text-base md:text-lg break-words leading-relaxed mb-6 md:mb-8">{owner.bio}</p>
                
                {/* Social Media Links */}
                <div className="flex justify-center items-center space-x-6">
                  {owner.socialMedia.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-2 group-hover:bg-pink-200 transition-colors">
                        <social.icon className="h-6 w-6 text-pink-600" />
                      </div>
                      <span className="text-xs text-gray-600 group-hover:text-pink-600 transition-colors break-words">
                        {social.handle}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 break-words">Our Mission</h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 md:mb-8 break-words">
              "To create exceptional baked goods that bring people together, celebrate life's special moments, and
              spread joy one delicious bite at a time. We believe that every cake tells a story, every cupcake sparks a
              smile, and every customer deserves nothing but the best."
            </p>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto"></div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
