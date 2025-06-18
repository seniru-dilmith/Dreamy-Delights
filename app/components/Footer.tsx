"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Dreamy Delights
              </h3>
              <p className="text-gray-300 mb-4">
                Creating sweet memories with every bite. Fresh, delicious, and made with love.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Menu", "About", "Gallery", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-gray-300 hover:text-pink-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-pink-400" />
                <span className="text-gray-300">123 Sweet Street, Bakery City, BC 12345</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-pink-400" />
                <span className="text-gray-300">(555) 123-CAKE</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-pink-400" />
                <span className="text-gray-300">hello@dreamydelights.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hours</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-3 text-pink-400" />
                <div className="text-gray-300">
                  <div>Mon-Fri: 7AM-8PM</div>
                  <div>Sat-Sun: 8AM-9PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">© 2024 Dreamy Delights Bakery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
