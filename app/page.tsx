"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFeaturedProducts, fetchFeaturedTestimonials } from "@/firebase/api"
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

// Testimonial type definition
interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  featured?: boolean;
  createdAt?: any;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Load featured products
      try {
        const productResponse = await fetchFeaturedProducts();
        
        if (productResponse.success && productResponse.data.length > 0) {
          console.log(`Successfully loaded ${productResponse.data.length} products from API`);
          setFeaturedProducts(productResponse.data);
        } else {
          console.log('No products found in API');
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }

      // Load featured testimonials
      try {
        const testimonialResponse = await fetchFeaturedTestimonials();
        
        if (testimonialResponse.success && testimonialResponse.data.length > 0) {
          console.log(`Successfully loaded ${testimonialResponse.data.length} testimonials from API`);
          setTestimonials(testimonialResponse.data);
        } else {
          console.log('No testimonials found in API or API error:', testimonialResponse.error || 'Unknown error');
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching featured testimonials:", error);
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
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
          className="relative z-10 text-center text-white px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 w-full max-w-7xl mx-auto"
        >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24 bg-gradient-to-r from-pink-300 to-purple-50 bg-clip-text text-transparent drop-shadow-lg leading-tight">
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
      <section className="py-20 px-4 bg-white overflow-hidden">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">{loading ? (
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
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="w-full"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
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
                        <h3 className="text-xl font-semibold text-left flex-1 min-w-0">{product.name}</h3>
                        <div className="flex items-center flex-shrink-0 ml-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xl font-bold text-pink-600">${product.price}</span>
                        <Button className="bg-pink-500 hover:bg-pink-600 text-sm">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // No products available
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for our delicious treats!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Sweet Story</h2>
              <p className="text-base md:text-lg text-gray-700 mb-6">
                For over 15 years, Dreamy Delights has been crafting the finest cakes and cupcakes with love, passion,
                and the highest quality ingredients. Every creation tells a story of dedication to the art of baking.
              </p>
              <div className="flex items-center justify-between sm:justify-start sm:space-x-8 mb-6">
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
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/about">Read Our Full Story</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
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
              <div className="absolute -bottom-3 -left-3 md:-bottom-6 md:-left-6 bg-white p-3 md:p-4 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mr-2 md:mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm md:text-base">Award Winning</div>
                    <div className="text-xs md:text-sm text-gray-600">Best Bakery 2023</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg md:text-xl text-gray-600">Don't just take our word for it</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonialsLoading ? (
              // Loading skeletons for testimonials
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`testimonial-skeleton-${index}`} className="animate-pulse">
                  <Card className="p-6 text-center h-full">
                    <div className="flex justify-center mb-4 space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-5 w-5 bg-gray-300 rounded"></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-32 mx-auto"></div>
                  </Card>
                </div>
              ))
            ) : testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-full"
                >
                  <Card className="p-6 text-center h-full">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic text-sm md:text-base">"{testimonial.text}"</p>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  </Card>
                </motion.div>
              ))
            ) : (
              // No testimonials available
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No testimonials available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for customer reviews!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Order Your Sweet Dreams?</h2>
            <p className="text-lg md:text-xl mb-8">
              Browse our full menu and place your order today. Fresh baked goods delivered to your door!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/menu">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Menu
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white hover:bg-white text-purple-600 w-full sm:w-auto"
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
