"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  EyeOff,
  MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchTestimonials,
  createTestimonialAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
} from "@/firebase/api";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  featured: boolean;
  createdAt: any;
  updatedAt?: any;
}

export default function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    rating: 5,
    featured: false
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonialsData();
  }, []);

  const fetchTestimonialsData = async () => {
    try {
      setLoading(true);
      const response = await fetchTestimonials();
      
      if (response.success) {
        setTestimonials(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch testimonials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestimonial = async () => {
    try {
      const response = await createTestimonialAdmin(formData);
      
      if (response.success) {
        setTestimonials(prev => [response.data, ...prev]);
        setFormData({ name: '', text: '', rating: 5, featured: false });
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Testimonial created successfully!",
        });
      } else {
        throw new Error(response.message || 'Failed to create testimonial');
      }
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create testimonial. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTestimonial = async (id: string, updateData: Partial<Testimonial>) => {
    try {
      const response = await updateTestimonialAdmin(id, updateData);
      
      if (response.success) {
        setTestimonials(prev => 
          prev.map(testimonial => 
            testimonial.id === id ? { ...testimonial, ...response.data } : testimonial
          )
        );
        setEditingId(null);
        toast({
          title: "Success",
          description: "Testimonial updated successfully!",
        });
      } else {
        throw new Error(response.message || 'Failed to update testimonial');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update testimonial. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const response = await deleteTestimonialAdmin(id);
      
      if (response.success) {
        setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
        toast({
          title: "Success",
          description: "Testimonial deleted successfully!",
        });
      } else {
        throw new Error(response.message || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    await updateTestimonial(id, { featured: !currentFeatured });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
    const [localData, setLocalData] = useState({
      name: testimonial.name,
      text: testimonial.text,
      rating: testimonial.rating,
      featured: testimonial.featured
    });

    const isEditing = editingId === testimonial.id;

    const handleSave = () => {
      updateTestimonial(testimonial.id, localData);
    };

    const handleCancel = () => {
      setLocalData({
        name: testimonial.name,
        text: testimonial.text,
        rating: testimonial.rating,
        featured: testimonial.featured
      });
      setEditingId(null);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={localData.name}
                    onChange={(e) => setLocalData(prev => ({ ...prev, name: e.target.value }))}
                    className="font-semibold text-lg"
                    placeholder="Customer name"
                  />
                ) : (
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 cursor-pointer ${
                            i < localData.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                          onClick={() => setLocalData(prev => ({ ...prev, rating: i + 1 }))}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  )}
                  {testimonial.featured && (
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFeatured(testimonial.id, testimonial.featured)}
                  className="p-2"
                >
                  {testimonial.featured ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleSave} className="p-2">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel} className="p-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(testimonial.id)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={localData.text}
                  onChange={(e) => setLocalData(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Testimonial text..."
                  rows={4}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`featured-${testimonial.id}`}
                    checked={localData.featured}
                    onCheckedChange={(checked) => 
                      setLocalData(prev => ({ ...prev, featured: checked }))
                    }
                  />
                  <Label htmlFor={`featured-${testimonial.id}`}>Featured</Label>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Testimonial Management</h1>
            <p className="text-gray-600">Manage customer testimonials and reviews</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
              <DialogDescription>
                Create a new customer testimonial for the website.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer name..."
                />
              </div>
              <div>
                <Label htmlFor="text">Testimonial</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter testimonial text..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 cursor-pointer ${
                        i < formData.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, featured: checked }))
                  }
                />
                <Label htmlFor="featured">Featured on homepage</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createTestimonial}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Testimonial
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.length}</div>
            <p className="text-xs text-muted-foreground">All customer reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials.filter(t => t.featured).length}
            </div>
            <p className="text-xs text-muted-foreground">Shown on homepage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonials.length > 0 
                ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No testimonials yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Start by adding your first customer testimonial to showcase reviews.
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      )}
    </div>
  );
}
