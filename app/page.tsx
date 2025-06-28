"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase/init"
import { useEffect, useState } from "react"

// Product type definition
interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  category?: string;
  featured?: boolean;
}


const testimonials = [
  {
    name: "Sarah Johnson",
    text: "The best cupcakes in town! Always fresh and delicious.",
    rating: 5,
  },
  {
    name: "Mike Chen",
    text: "Ordered a custom cake for my daughter's birthday. Absolutely perfect!",
    rating: 5,
  },
  {
    name: "Emily Davis",
    text: "Great service and amazing flavors. Highly recommend!",
    rating: 5,
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        if (!db) {
          console.warn("Firebase is not initialized.");
          setFeaturedProducts([]);
          setLoading(false);
          return;
        }

        const querySnapshot = await getDocs(collection(db, "featured_products"));
        const items: Product[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Product));
        
        if (items.length === 0) {
          console.log('No products found in Firestore, using fallback data');
          setFeaturedProducts([]);
        } else {
          console.log(`Successfully loaded ${items.length} products from Firestore`);
          setFeaturedProducts(items);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        console.log('Using fallback products due to error');
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/logo-large.png"
            alt="Dreamy Delights Background"
            width={800}
            height={300}
            className="object-cover object-center mx-auto"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-10 sm:px-20 md:px-32 lg:px-40 xl:px-48"
        >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-32 sm:mb-32 md:mb-40 lg:mb-48 xl:mb-80 bg-gradient-to-r from-pink-300 to-purple-50 bg-clip-text text-transparent drop-shadow-lg">
              Every Bite is a Sweet Dream Come True
            </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-lg mx-auto">
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-base sm:text-lg shadow-lg">
              <Link href="/menu">
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Order Now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white bg-white hover:bg-slate-200 text-gray-900 text-base sm:text-lg shadow-lg backdrop-blur-sm"
            >
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Delights</h2>
            <p className="text-xl text-gray-600">Our most popular treats, made fresh daily</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="overflow-hidden">
                    <div className="bg-gray-300 h-64 w-full"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-8 bg-gray-300 rounded w-20"></div>
                        <div className="h-10 bg-gray-300 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative">
                      <Image
                        src={product.image || "/logo-large.png"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
                      >
                        <Heart className="h-5 w-5 text-pink-500" />
                      </motion.button>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-pink-600">${product.price}</span>
                        <Button className="bg-pink-500 hover:bg-pink-600">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Sweet Story</h2>
              <p className="text-lg text-gray-700 mb-6">
                For over 15 years, Dreamy Delights has been crafting the finest cakes and cupcakes with love, passion,
                and the highest quality ingredients. Every creation tells a story of dedication to the art of baking.
              </p>
              <div className="flex items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">10k+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">50+</div>
                  <div className="text-sm text-gray-600">Unique Flavors</div>
                </div>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Read Our Full Story</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <Image
                src="/logo-large.png"
                alt="Bakery Interior"
                width={600}
                height={500}
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className="font-semibold">Award Winning</div>
                    <div className="text-sm text-gray-600">Best Bakery 2023</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl font-bold mb-6">Ready to Order Your Sweet Dreams?</h2>
            <p className="text-xl mb-8">
              Browse our full menu and place your order today. Fresh baked goods delivered to your door!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/menu">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Menu
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white hover:bg-white text-purple-600"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
