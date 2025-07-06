"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Plus, Edit, Trash2, Upload, Search, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  adminFetchProducts, 
  adminCreateProduct, 
  adminCreateProductJSON,
  adminUpdateProduct, 
  adminUpdateProductJSON,
  adminDeleteProduct 
} from "@/firebase/api";
import { ImageUploadService } from "@/utils/imageUpload";
import { InputSanitizer } from "@/utils/encryption";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  imagePath?: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Cakes",
  "Cupcakes", 
  "Pastries",
  "Cookies",
  "Breads",
  "Desserts"
];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    featured: false,
    active: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetchProducts();
      
      if (response.success) {
        // Normalize product data to ensure consistent structure
        const normalizedProducts = (response.data || []).map((product: any) => {
          const normalized: Product = {
            id: product.id || 'unknown', // Ensure ID is always present
            name: product.name || 'Unnamed Product',
            description: product.description || '',
            price: typeof product.price === 'number' ? product.price : 0,
            category: product.category || 'Uncategorized',
            stock: typeof product.stock === 'number' ? product.stock : 0,
            imageUrl: product.imageUrl || product.image || '/placeholder.jpg', // Handle both fields
            featured: Boolean(product.featured),
            active: product.active !== false, // Default to true if not specified
            createdAt: product.createdAt || new Date().toISOString(),
            updatedAt: product.updatedAt || new Date().toISOString(),
          };
          
          return normalized;
        });
        
        setProducts(normalizedProducts);
      } else {
        console.error("🔧 ProductManagement: Failed to load products:", response.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("🔧 ProductManagement: Error loading products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const result = await ImageUploadService.uploadImage(file, "products");
      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        ...formData,
        name: InputSanitizer.sanitizeForDatabase(formData.name),
        description: InputSanitizer.sanitizeForDatabase(formData.description),
      };

      let finalData: typeof sanitizedData & { imageUrl?: string } = { ...sanitizedData };

      // Handle image upload if there's a new image file
      const hasNewImageFile = imageFile && imageFile instanceof File && imageFile.size > 0;
      
      if (hasNewImageFile) {
        try {
          const uploadResult = await ImageUploadService.uploadImage(
            imageFile,
            'products',
            editingProduct ? `${editingProduct.id}-${Date.now()}` : undefined
          );
          finalData.imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          alert('Failed to upload image: ' + (uploadError as Error).message);
          return;
        }
      }

      // Send product data (always as JSON now)
      let response;
      if (editingProduct) {
        response = await adminUpdateProductJSON(editingProduct.id, finalData);
      } else {
        response = await adminCreateProductJSON(finalData);
      }

      if (response.success) {
        // Reload products to get the latest data
        await loadProducts();
        resetForm();
        setIsDialogOpen(false);
      } else {
        console.error('❌ Product operation failed:', response);
        // Display full error details
        const status = response.status ?? 'N/A';
        const statusText = response.statusText ?? '';
        const errorData = response.errorData ?? response;
        alert(`Error ${status} ${statusText}: ${response.message}\nDetails: ${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      console.error('💥 Error saving product:', error);
      alert("An error occurred while saving the product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      category: product.category || "",
      stock: product.stock || 0,
      featured: product.featured || false,
      active: product.active !== undefined ? product.active : true,
    });
    setImagePreview(product.imageUrl || "");
    // Reset image file state when editing existing product
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await adminDeleteProduct(productId);
      if (response.success) {
        // Reload products to reflect the deletion
        await loadProducts();
      } else {
        console.error("Failed to delete product:", response.message);
        alert(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product");
    }
  };

  const toggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      // Use JSON update instead of FormData for simple field updates
      const updateData = {
        featured: !currentFeatured
      };
      
      const response = await adminUpdateProductJSON(productId, updateData);
      
      if (response.success) {
        // Reload products to reflect the change
        await loadProducts();
      } else {
        console.error("❌ Failed to update featured status:", response.message);
        alert(response.message || "Failed to update featured status");
      }
    } catch (error) {
      console.error("💥 Error updating featured status:", error);
      alert("An error occurred while updating the featured status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      featured: false,
      active: true,
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const validation = ImageUploadService.validateFile(file);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      // Clear image file if no file selected
      setImageFile(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesFeatured = !showFeaturedOnly || product.featured;
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (Rs.)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Product Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <Image src={imagePreview} alt="Preview" width={128} height={128} className="w-32 h-32 object-cover rounded-lg" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      <span>Featured Product</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.active !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : editingProduct ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showFeaturedOnly ? "default" : "outline"}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className="w-full md:w-auto"
              >
                <Star className="w-4 h-4 mr-2" />
                {showFeaturedOnly ? "Show All" : "Featured Only"}
              </Button>
            </div>

            {/* Featured Products Summary */}
            {showFeaturedOnly && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-yellow-800">Featured Products Management</h3>
                    <p className="text-sm text-yellow-600">
                      Currently showing {filteredProducts.length} featured product(s). 
                      These products will appear on the homepage.
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="rounded-md border">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading products...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {showFeaturedOnly ? "No featured products found" : "No products found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Image
                              src={product.imageUrl || "/placeholder.jpg"}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>Rs. {product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {product.featured && <Badge variant="secondary">Featured</Badge>}
                              <Badge variant={product.active ? "default" : "destructive"}>
                                {product.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEdit(product)}
                                title="Edit product"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={product.featured ? "default" : "outline"}
                                onClick={() => toggleFeatured(product.id, product.featured)}
                                title={product.featured ? "Remove from featured" : "Add to featured"}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDelete(product.id)}
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
