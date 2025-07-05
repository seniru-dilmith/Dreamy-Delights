"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa"

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
                  href="https://www.facebook.com/dreamydels"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <FaFacebookF className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="https://www.instagram.com/dreamy_dels/"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <FaInstagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="https://wa.me/message/G54ADT3RXJYXF1"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <FaWhatsapp className="h-5 w-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Menu", "About", "Contact"].map((item) => (
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
                <FaMapMarkerAlt className="h-4 w-4 mr-3 text-pink-400" />
                <span className="text-gray-300">Horana, Sri Lanka</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="h-4 w-4 mr-3 text-pink-400" />
                <span className="text-gray-300">(070) 630 9127</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="h-4 w-4 mr-3 text-pink-400" />
                <span className="text-gray-300">sansilunikethma@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hours</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <FaClock className="h-4 w-4 mr-3 text-pink-400" />
                <div className="text-gray-300">
                  <div>Mon-Fri: 7:00 AM-8:00 PM</div>
                  <div>Sat-Sun: 8:00 AM-9:00 PM</div>
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
