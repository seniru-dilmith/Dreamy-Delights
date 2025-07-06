"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload, Edit, Trash2, Image as ImageIcon, FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  adminFetchContent, 
  adminUpdateContent,
  fetchTestimonials 
} from "@/firebase/api";
import { ImageUploadService } from "@/utils/imageUpload";
import { InputSanitizer } from "@/utils/encryption";

interface BannerContent {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  imagePath?: string;
  active: boolean;
  order: number;
}

interface Testimonial {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  imageUrl?: string;
  imagePath?: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
}

interface AboutContent {
  id: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
  imagePath?: string;
  order: number;
}

export default function ContentManagement() {
  const [banners, setBanners] = useState<BannerContent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutContent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("banners");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states for different content types
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    active: true,
    order: 0,
  });

  const [testimonialForm, setTestimonialForm] = useState({
    customerName: "",
    content: "",
    rating: 5,
    active: true,
    featured: false,
  });

  const [aboutForm, setAboutForm] = useState({
    section: "",
    title: "",
    content: "",
    order: 0,
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Load banners and about content
      const contentResponse = await adminFetchContent();
      if (contentResponse.success) {
        const data = contentResponse.data || {};
        setBanners(data.banners || []);
        setAboutSections(data.aboutSections || []);
      } else {
        console.error("Failed to load content:", contentResponse.message);
        setBanners([]);
        setAboutSections([]);
      }

      // Load testimonials
      const testimonialsResponse = await fetchTestimonials();
      if (testimonialsResponse.success) {
        setTestimonials(testimonialsResponse.data || []);
      } else {
        console.error("Failed to load testimonials:", testimonialsResponse.error);
        setTestimonials([]);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      setBanners([]);
      setTestimonials([]);
      setAboutSections([]);
    } finally {
      setIsLoading(false);
    }
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
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedData = {
        ...bannerForm,
        title: InputSanitizer.sanitizeForDatabase(bannerForm.title),
        subtitle: InputSanitizer.sanitizeForDatabase(bannerForm.subtitle),
      };

      let imageData = null;
      if (imageFile) {
        imageData = await ImageUploadService.uploadImage(imageFile, "banners");
      }

      if (editingItem) {
        const updatedBanner = {
          ...editingItem,
          ...sanitizedData,
          ...(imageData && { imageUrl: imageData.url, imagePath: imageData.fullPath }),
        };
        setBanners(prev => prev.map(b => b.id === editingItem.id ? updatedBanner : b));
      } else {
        const newBanner: BannerContent = {
          id: Date.now().toString(),
          ...sanitizedData,
          ...(imageData && { imageUrl: imageData.url, imagePath: imageData.fullPath }),
        };
        setBanners(prev => [...prev, newBanner]);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedData = {
        ...testimonialForm,
        customerName: InputSanitizer.sanitizeForDatabase(testimonialForm.customerName || ""),
        content: InputSanitizer.sanitizeForDatabase(testimonialForm.content || ""),
        rating: typeof testimonialForm.rating === 'number' ? testimonialForm.rating : 5,
        active: testimonialForm.active !== undefined ? testimonialForm.active : true,
        featured: testimonialForm.featured !== undefined ? testimonialForm.featured : false,
      };

      let imageData = null;
      if (imageFile) {
        imageData = await ImageUploadService.uploadImage(imageFile, "testimonials");
      }

      if (editingItem) {
        const updatedTestimonial = {
          ...editingItem,
          ...sanitizedData,
          ...(imageData && { imageUrl: imageData.url, imagePath: imageData.fullPath }),
        };
        setTestimonials(prev => prev.map(t => t.id === editingItem.id ? updatedTestimonial : t));
      } else {
        const newTestimonial: Testimonial = {
          id: Date.now().toString(),
          ...sanitizedData,
          ...(imageData && { imageUrl: imageData.url, imagePath: imageData.fullPath }),
          createdAt: new Date().toISOString(),
        };
        setTestimonials(prev => [...prev, newTestimonial]);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving testimonial:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedData = {
        ...aboutForm,
        title: InputSanitizer.sanitizeForDatabase(aboutForm.title),
        content: InputSanitizer.sanitizeForDatabase(aboutForm.content),
        section: InputSanitizer.sanitizeForDatabase(aboutForm.section),
      };

      let imageData = null;
      if (imageFile) {
        imageData = await ImageUploadService.uploadImage(imageFile, "banners");
      }

      if (editingItem) {
        const updatedSection = {
          ...editingItem,
          ...sanitizedData,
          ...(imageData && { imageUrl: imageData.url, imagePath: imageData.fullPath }),
        };
        setAboutSections(prev => prev.map(s => s.id === editingItem.id ? updatedSection : s));
      } else {
        const newSection: AboutContent = {
          id: Date.now().toString(),
          ...sanitizedData,
          ...(imageData && { imageUrl: imageData.url, imagePath: imageData.fullPath }),
        };
        setAboutSections(prev => [...prev, newSection]);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving about section:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBannerForm({ title: "", subtitle: "", active: true, order: 0 });
    setTestimonialForm({ customerName: "", content: "", rating: 5, active: true, featured: false });
    setAboutForm({ section: "", title: "", content: "", order: 0 });
    setEditingItem(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setActiveTab(type);
    
    if (type === "banners") {
      setBannerForm({
        title: item.title,
        subtitle: item.subtitle,
        active: item.active,
        order: item.order,
      });
    } else if (type === "testimonials") {
      setTestimonialForm({
        customerName: item?.customerName || "",
        content: item?.content || "",
        rating: typeof item?.rating === 'number' ? item.rating : 5,
        active: item?.active !== undefined ? item.active : true,
        featured: item?.featured || false,
      });
    } else if (type === "about") {
      setAboutForm({
        section: item.section,
        title: item.title,
        content: item.content,
        order: item.order,
      });
    }
    
    setImagePreview(item.imageUrl || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, type: string, imagePath?: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    if (imagePath) {
      try {
        await ImageUploadService.deleteImage(imagePath);
      } catch (error) {
        console.warn("Could not delete image:", error);
      }
    }

    if (type === "banners") {
      setBanners(prev => prev.filter(b => b.id !== id));
    } else if (type === "testimonials") {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } else if (type === "about") {
      setAboutSections(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="banners">Banners</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <TabsContent value="banners" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Hero Banners</h3>
                  <Dialog open={isDialogOpen && activeTab === "banners"} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForm(); setActiveTab("banners"); }}>
                        <Upload className="w-4 h-4 mr-2" />
                        Add Banner
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Banner" : "Add New Banner"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleBannerSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={bannerForm.title}
                            onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subtitle">Subtitle</Label>
                          <Input
                            id="subtitle"
                            value={bannerForm.subtitle}
                            onChange={(e) => setBannerForm(prev => ({ ...prev, subtitle: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image">Banner Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          {imagePreview && (
                            <Image src={imagePreview} alt="Preview" width={300} height={128} className="w-full h-32 object-cover rounded-lg" />
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={bannerForm.active}
                              onChange={(e) => setBannerForm(prev => ({ ...prev, active: e.target.checked }))}
                            />
                            <span>Active</span>
                          </label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banners.map(banner => (
                    <Card key={banner.id}>
                      <CardContent className="p-4">
                        <Image
                          src={banner.imageUrl || '/placeholder.jpg'}
                          alt={banner.title}
                          width={300}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-medium mb-1">{banner.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(banner, "banners")}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(banner.id, "banners", banner.imagePath)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="testimonials" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Customer Testimonials</h3>
                  <Dialog open={isDialogOpen && activeTab === "testimonials"} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForm(); setActiveTab("testimonials"); }}>
                        <Star className="w-4 h-4 mr-2" />
                        Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit Testimonial" : "Add New Testimonial"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Customer Name</Label>
                          <Input
                            id="customerName"
                            value={testimonialForm.customerName}
                            onChange={(e) => setTestimonialForm(prev => ({ ...prev, customerName: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="content">Testimonial Content</Label>
                          <Textarea
                            id="content"
                            value={testimonialForm.content}
                            onChange={(e) => setTestimonialForm(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rating">Rating</Label>
                          <select
                            id="rating"
                            title="Select testimonial rating"
                            value={testimonialForm.rating}
                            onChange={(e) => setTestimonialForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                            className="w-full p-2 border rounded-md"
                          >
                            {[1, 2, 3, 4, 5].map(rating => (
                              <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customerImage">Customer Image (optional)</Label>
                          <Input
                            id="customerImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          {imagePreview && (
                            <Image src={imagePreview} alt="Preview" width={80} height={80} className="w-20 h-20 object-cover rounded-full" />
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={testimonialForm.featured}
                              onChange={(e) => setTestimonialForm(prev => ({ ...prev, featured: e.target.checked }))}
                            />
                            <span>Featured</span>
                          </label>
                          
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={testimonialForm.active}
                              onChange={(e) => setTestimonialForm(prev => ({ ...prev, active: e.target.checked }))}
                            />
                            <span>Active</span>
                          </label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testimonials && testimonials.length > 0 ? testimonials.map(testimonial => (
                    <Card key={testimonial?.id || Math.random().toString()}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          {testimonial?.imageUrl ? (
                            <Image
                              src={testimonial.imageUrl}
                              alt={testimonial?.customerName || 'Customer'}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-lg">
                                {testimonial?.customerName && testimonial.customerName.length > 0 
                                  ? testimonial.customerName.charAt(0) 
                                  : '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{testimonial?.customerName || 'Anonymous'}</h4>
                            <div className="flex space-x-1">
                              {testimonial?.rating ? [...Array(Math.min(testimonial.rating, 5))].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              )) : null}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{testimonial?.content || 'No content'}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            {testimonial?.featured && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Featured</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${testimonial?.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {testimonial?.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial, "testimonials")}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial?.id, "testimonials", testimonial?.imagePath)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-2 p-6 text-center text-gray-500">
                      No testimonials found. Add your first testimonial using the button above.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">About Page Content</h3>
                  <Dialog open={isDialogOpen && activeTab === "about"} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { resetForm(); setActiveTab("about"); }}>
                        <FileText className="w-4 h-4 mr-2" />
                        Add Section
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Edit About Section" : "Add New About Section"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleAboutSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="section">Section ID</Label>
                          <Input
                            id="section"
                            value={aboutForm.section}
                            onChange={(e) => setAboutForm(prev => ({ ...prev, section: e.target.value }))}
                            placeholder="e.g., our-story, mission, team"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title">Section Title</Label>
                          <Input
                            id="title"
                            value={aboutForm.title}
                            onChange={(e) => setAboutForm(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={aboutForm.content}
                            onChange={(e) => setAboutForm(prev => ({ ...prev, content: e.target.value }))}
                            rows={6}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image">Section Image (optional)</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          {imagePreview && (
                            <Image src={imagePreview} alt="Preview" width={300} height={128} className="w-full h-32 object-cover rounded-lg" />
                          )}
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {aboutSections.map(section => (
                    <Card key={section.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{section.title}</h4>
                            <p className="text-sm text-gray-500 mb-2">Section: {section.section}</p>
                            <p className="text-gray-600 line-clamp-3">{section.content}</p>
                          </div>
                          {section.imageUrl && (
                            <Image
                              src={section.imageUrl}
                              alt={section.title}
                              width={96}
                              height={96}
                              className="w-24 h-24 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(section, "about")}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(section.id, "about", section.imagePath)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
