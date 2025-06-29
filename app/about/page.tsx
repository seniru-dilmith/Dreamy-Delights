"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Award, Users, Clock, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Head Baker & Owner",
    image: "/logo-large.svg?height=300&width=300",
    bio: "With 20 years of baking experience, Sarah founded Dreamy Delights to share her passion for creating beautiful, delicious treats.",
  },
  {
    name: "Mike Chen",
    role: "Pastry Chef",
    image: "/logo-large.svg?height=300&width=300",
    bio: "Mike specializes in intricate cake decorating and brings artistic flair to every custom creation.",
  },
  {
    name: "Emily Davis",
    role: "Customer Relations",
    image: "/logo-large.svg?height=300&width=300",
    bio: "Emily ensures every customer has a sweet experience from order to delivery.",
  },
]

const values = [
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every item is crafted with care and attention to detail",
  },
  {
    icon: Award,
    title: "Quality Ingredients",
    description: "We use only the finest, freshest ingredients available",
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Supporting our local community through partnerships and events",
  },
  {
    icon: Clock,
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
                Founded in 2009, Dreamy Delights began as a small home bakery with a big dream: to create the most
                delicious and beautiful baked goods that bring joy to every celebration.
              </p>
              <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 leading-relaxed">
                What started in Sarah's kitchen has grown into a beloved local bakery, but our commitment to quality,
                creativity, and customer satisfaction remains unchanged.
              </p>
              <div className="flex items-center justify-between sm:justify-start sm:space-x-6 md:space-x-8 max-w-sm mx-auto md:mx-0">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-pink-600">15+</div>
                  <div className="text-xs md:text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-pink-600">10k+</div>
                  <div className="text-xs md:text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-pink-600">50+</div>
                  <div className="text-xs md:text-sm text-gray-600">Unique Flavors</div>
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

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words">Meet Our Team</h2>
            <p className="text-lg md:text-xl text-gray-600 break-words">The talented people behind your favorite treats</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="w-full max-w-sm mx-auto md:max-w-none"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                  <Image
                    src={member.image || "/logo-large.png"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-full h-56 md:h-64 object-cover"
                  />
                  <CardContent className="p-4 md:p-6 text-center">
                    <h3 className="text-lg md:text-xl font-semibold mb-2 break-words">{member.name}</h3>
                    <p className="text-pink-600 font-medium mb-3 md:mb-4 text-sm md:text-base break-words">{member.role}</p>
                    <p className="text-gray-600 text-sm md:text-base break-words leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
