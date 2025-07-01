"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "../context/CartContext"
import { fetchProducts } from "@/firebase/api"
import { Product, getProductImageUrl, formatPrice, isProductAvailable } from "@/types/product"

const categories = ["All", "Cupcakes", "Cakes", "Cookies", "Pastries"]

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts({ limit: 50 }); // Get more products for menu
        
        if (response.success && response.data.length > 0) {
          console.log(`Successfully loaded ${response.data.length} products from API`);
          // Add default customizations if not present
          const productsWithCustomizations = response.data.map((product: any) => ({
            ...product,
            rating: product.rating || 4.8, // Default rating if not in API
            customizations: product.customizations || {
              sizes: ["Regular", "Large"],
              flavors: ["Original", "Chocolate", "Vanilla"],
              decorations: ["Classic", "Decorated", "Custom Message"],
            }
          }));
          setProducts(productsWithCustomizations);
        } else {
          console.log('No products found in API');
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((product: Product) => product.category === selectedCategory)

  const handleAddToCart = (product: Product, customizations?: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: getProductImageUrl(product),
      customizations,
    })
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delicious products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-xl text-gray-600">Discover our delicious selection of fresh baked goods</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🧁</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === "All" 
                ? "We're currently updating our menu. Please check back soon!" 
                : `No ${selectedCategory.toLowerCase()} available at the moment.`}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory("All")}
              className="mr-4"
            >
              View All Categories
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <Image
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-pink-500">{product.category}</Badge>
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
                      <span className="text-2xl font-bold text-pink-600">Rs. {product.price}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                          Customize
                        </Button>
                        <Button className="bg-pink-500 hover:bg-pink-600" onClick={() => handleAddToCart(product)}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Customization Modal */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4">Customize {selectedProduct.name}</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="size-select" className="block text-sm font-medium mb-2">Size</label>
                  <select id="size-select" className="w-full p-2 border rounded-md">
                    {selectedProduct.customizations?.sizes?.map((size: string) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="flavor-select" className="block text-sm font-medium mb-2">Flavor</label>
                  <select id="flavor-select" className="w-full p-2 border rounded-md">
                    {selectedProduct.customizations?.flavors?.map((flavor: string) => (
                      <option key={flavor} value={flavor}>
                        {flavor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="decoration-select" className="block text-sm font-medium mb-2">Decoration</label>
                  <select id="decoration-select" className="w-full p-2 border rounded-md">
                    {selectedProduct.customizations?.decorations?.map((decoration: string) => (
                      <option key={decoration} value={decoration}>
                        {decoration}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setSelectedProduct(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
