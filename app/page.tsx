"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Product, Testimonial, getProductImageUrl, formatPrice } from "@/types/product"
import { fetchFeaturedProducts, fetchFeaturedTestimonials } from "@/firebase/api"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadData = async () => {
      // Load featured products via Firebase Functions HTTP endpoint
      try {
        const productResponse = await fetchFeaturedProducts();
        
        if (productResponse.success && productResponse.data.length > 0) {
          setFeaturedProducts(productResponse.data);
        } else {
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
          setTestimonials(testimonialResponse.data);
        } else {
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
  }, [mounted]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-10rem)]">
            
            {/* Left Side - Logo */}
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center order-1 lg:order-1"
              >
                <div className="relative">
                  {/* Decorative background circle */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-300/30 rounded-full blur-3xl scale-150"></div>
                  <div className="relative z-10 p-8 md:p-12">
                    <Image
                      src="/logo-large.png"
                      alt="Dreamy Delights Logo"
                      width={400}
                      height={400}
                      className="w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg h-auto drop-shadow-2xl"
                      priority
                    />
                    {/* Floating elements */}
                    <motion.div
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-4 -right-4 w-8 h-8 bg-pink-300 rounded-full opacity-60"
                    ></motion.div>
                    <motion.div
                      animate={{ y: [10, -10, 10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-6 -left-6 w-6 h-6 bg-purple-300 rounded-full opacity-60"
                    ></motion.div>
                    <motion.div
                      animate={{ y: [-5, 15, -5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/2 -right-8 w-4 h-4 bg-rose-300 rounded-full opacity-60"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center order-1 lg:order-1">
                <div className="relative">
                  {/* Decorative background circle */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-300/30 rounded-full blur-3xl scale-150"></div>
                  <div className="relative z-10 p-8 md:p-12">
                    <Image
                      src="/logo-large.png"
                      alt="Dreamy Delights Logo"
                      width={400}
                      height={400}
                      className="w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg h-auto drop-shadow-2xl"
                      priority
                    />
                    {/* Static floating elements for SSR */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-300 rounded-full opacity-60"></div>
                    <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-purple-300 rounded-full opacity-60"></div>
                    <div className="absolute top-1/2 -right-8 w-4 h-4 bg-rose-300 rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Right Side - Content */}
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col justify-center order-2 lg:order-2 text-center lg:text-left space-y-6 md:space-y-8"
              >

                {/* Main Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
                >
                  <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                    Every Bite
                  </span>
                  <br />
                  <span className="text-gray-800">
                    is a Sweet
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Dream Come True
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Handcrafted with love, baked to perfection. Experience the magic of our artisanal cakes, cupcakes, and sweet treats that make every moment special.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0 w-full"
                >
                  <Button 
                    asChild 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[2.5rem] md:min-h-[4rem] h-10 md:h-16 text-base md:text-lg font-semibold px-6 py-3"
                  >
                    <Link href="/menu" className="flex items-center justify-center w-full h-full">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Order Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 shadow-md hover:shadow-lg transition-all duration-300 min-h-[2.5rem] md:min-h-[4rem] h-10 md:h-16 text-base md:text-lg font-semibold px-6 py-3"
                  >
                    <Link href="/about" className="flex items-center justify-center w-full h-full">
                      <Heart className="mr-2 h-5 w-5" />
                      Our Story
                    </Link>
                  </Button>
                </motion.div>

                {/* Customer Rating */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="flex items-center justify-center lg:justify-start space-x-4 pt-4"
                >
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-800">4.9/5</span> from 50+ reviews
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="flex flex-col justify-center order-2 lg:order-2 text-center lg:text-left space-y-6 md:space-y-8">
                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                    Every Bite
                  </span>
                  <br />
                  <span className="text-gray-800">
                    is a Sweet
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Dream Come True
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Handcrafted with love, baked to perfection. Experience the magic of our artisanal cakes, cupcakes, and sweet treats that make every moment special.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0 w-full">
                  <Button 
                    asChild 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[2.5rem] md:min-h-[4rem] h-10 md:h-16 text-base md:text-lg font-semibold px-6 py-3"
                  >
                    <Link href="/menu" className="flex items-center justify-center w-full h-full">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Order Now
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 shadow-md hover:shadow-lg transition-all duration-300 min-h-[2.5rem] md:min-h-[4rem] h-10 md:h-16 text-base md:text-lg font-semibold px-6 py-3"
                  >
                    <Link href="/about" className="flex items-center justify-center w-full h-full">
                      <Heart className="mr-2 h-5 w-5" />
                      Our Story
                    </Link>
                  </Button>
                </div>

                {/* Customer Rating */}
                <div className="flex items-center justify-center lg:justify-start space-x-4 pt-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-800">4.9/5</span> from 50+ reviews
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-rose-200 rounded-full opacity-30 blur-lg"></div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {mounted ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Delights</h2>
              <p className="text-xl text-gray-600">Our most popular treats, made fresh daily</p>
            </motion.div>
          ) : (
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Delights</h2>
              <p className="text-xl text-gray-600">Our most popular treats, made fresh daily</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {!mounted || loading ? (
              // Loading skeletons or SSR fallback
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
                mounted ? (
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
                          src={getProductImageUrl(product)}
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
                        <div className="flex items-center justify-center">
                          <span className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div key={product.id} className="w-full">
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                      <div className="relative">
                        <Image
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover"
                        />
                        <button 
                          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
                          title="Add to favorites"
                          aria-label="Add to favorites"
                        >
                          <Heart className="h-5 w-5 text-pink-500" />
                        </button>
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
                        <div className="flex items-center justify-center">
                          <span className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              ))
            ) : (
              // No products available
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for our delicious treats!</p>
              </div>
            )}
          </div>
          
          {/* See the Full Menu Button */}
          {mounted ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mt-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 h-14 px-8 text-lg font-semibold rounded-full relative overflow-hidden group"
                >
                  <Link href="/menu" className="flex items-center justify-center relative z-10">
                    <motion.div
                      animate={{ 
                        x: [0, 5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="mr-3"
                    >
                      <ShoppingCart className="h-6 w-6" />
                    </motion.div>
                    See the Full Menu
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="ml-3"
                    >
                      ✨
                    </motion.div>
                    {/* Animated background gradient */}
                    <motion.div
                      animate={{
                        background: [
                          "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                          "linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)",
                          "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                    />
                  </Link>
                </Button>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-600 mt-4 text-sm"
              >
                Discover our complete collection of handcrafted delights
              </motion.p>
            </motion.div>
          ) : (
            <div className="text-center mt-16">
              <div className="inline-block">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-500 h-14 px-8 text-lg font-semibold rounded-full relative overflow-hidden group"
                >
                  <Link href="/menu" className="flex items-center justify-center relative z-10">
                    <div className="mr-3">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    See the Full Menu
                    <div className="ml-3">
                      ✨
                    </div>
                  </Link>
                </Button>
              </div>
              <p className="text-gray-600 mt-4 text-sm">
                Discover our complete collection of handcrafted delights
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {mounted ? (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-2 md:order-1"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Sweet Story</h2>
                <p className="text-base md:text-lg text-gray-700 mb-6">
                  Dreamy Delights has been crafting the finest cakes and cupcakes with love, passion,
                  and the highest quality ingredients. Every creation tells a story of dedication to the art of baking.
                </p>
                <div className="flex items-center justify-between sm:justify-start sm:space-x-8 mb-6">
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
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/about">Read Our Full Story</Link>
                </Button>
              </motion.div>
            ) : (
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Sweet Story</h2>
                <p className="text-base md:text-lg text-gray-700 mb-6">
                  Dreamy Delights has been crafting the finest cakes and cupcakes with love, passion,
                  and the highest quality ingredients. Every creation tells a story of dedication to the art of baking.
                </p>
                <div className="flex items-center justify-between sm:justify-start sm:space-x-8 mb-6">
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
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/about">Read Our Full Story</Link>
                </Button>
              </div>
            )}
            {mounted ? (
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
                      <div className="font-semibold text-sm md:text-base">Delightful Treats</div>
                      <div className="text-xs md:text-sm text-gray-600">Baked Fresh Daily</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="relative order-1 md:order-2">
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
                      <div className="font-semibold text-sm md:text-base">Delightful Treats</div>
                      <div className="text-xs md:text-sm text-gray-600">Baked Fresh Daily</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {mounted ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-lg md:text-xl text-gray-600">Don&rsquo;t just take our word for it</p>
            </motion.div>
          ) : (
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-lg md:text-xl text-gray-600">Don&rsquo;t just take our word for it.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {!mounted || testimonialsLoading ? (
              // Loading skeletons for testimonials or SSR fallback
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
                mounted ? (
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
                      <p className="text-gray-700 mb-4 italic text-sm md:text-base">&ldquo;{testimonial.text}&rdquo;</p>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    </Card>
                  </motion.div>
                ) : (
                  <div key={testimonial.id} className="w-full">
                    <Card className="p-6 text-center h-full">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic text-sm md:text-base">&ldquo;{testimonial.text}&rdquo;</p>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    </Card>
                  </div>
                )
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
          {mounted ? (
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
          ) : (
            <div>
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
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
