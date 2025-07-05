"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Mail, 
  MailOpen, 
  Reply, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Phone,
  MessageSquare,
  RefreshCw,
  Filter,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  adminFetchContactMessages,
  adminFetchContactMessageStats,
  adminMarkContactMessageAsRead,
  adminMarkContactMessageAsReplied,
  adminDeleteContactMessage,
  adminUpdateContactMessage
} from "@/firebase/api"

interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied'
  priority: 'low' | 'normal' | 'high'
  createdAt: string | Date
  updatedAt?: string | Date
  readAt?: string | Date
  repliedAt?: string | Date
  readBy?: string
  repliedBy?: string
  reply?: string
}

interface ContactMessageStats {
  total: number
  unread: number
  read: number
  replied: number
  todayCount: number
}

export default function ContactMessageManagement() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<ContactMessageStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    todayCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const filterOptions: any = {}
      
      if (statusFilter !== 'all') {
        filterOptions.status = statusFilter
      }

      const response = await adminFetchContactMessages(filterOptions)
      
      if (response.success) {
        setMessages(response.data || [])
      } else {
        throw new Error(response.message || 'Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminFetchContactMessageStats()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching contact message stats:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchStats()
  }, [statusFilter])

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await adminMarkContactMessageAsRead(messageId)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Message marked as read",
        })
        await fetchMessages()
        await fetchStats()
      } else {
        throw new Error(response.message || 'Failed to mark as read')
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsReplied = async (messageId: string, reply?: string) => {
    try {
      const hasReplyText = reply && reply.trim().length > 0
      const response = await adminMarkContactMessageAsReplied(messageId, reply)
      
      if (response.success) {
        let successMessage = "Message marked as replied"
        let variant: "default" | "destructive" = "default"
        
        // Show email status feedback
        if (hasReplyText && response.emailSent) {
          successMessage = "🎉 Reply sent successfully and email delivered!"
          variant = "default"
        } else if (hasReplyText && response.emailError) {
          successMessage = `⚠️ Reply saved but email failed: ${response.emailError}`
          variant = "destructive"
        } else if (!hasReplyText) {
          successMessage = "✅ Message marked as replied (no email sent)"
          variant = "default"
        } else if (hasReplyText && !response.emailSent) {
          successMessage = "⚠️ Reply saved but email service not configured"
          variant = "destructive"
        }
        
        toast({
          title: "Success",
          description: successMessage,
          variant,
        })
        
        setIsReplyDialogOpen(false)
        setReplyText('')
        await fetchMessages()
        await fetchStats()
      } else {
        throw new Error(response.message || 'Failed to mark as replied')
      }
    } catch (error) {
      console.error('Error marking message as replied:', error)
      toast({
        title: "Error",
        description: "Failed to mark message as replied",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return
    }

    try {
      const response = await adminDeleteContactMessage(messageId)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        })
        await fetchMessages()
        await fetchStats()
      } else {
        throw new Error(response.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setIsViewDialogOpen(true)
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      handleMarkAsRead(message.id)
    }
  }

  const handleReplyMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setReplyText('')
    setIsReplyDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Unread</Badge>
      case 'read':
        return <Badge variant="secondary">Read</Badge>
      case 'replied':
        return <Badge variant="default">Replied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
  }

  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      message.firstName.toLowerCase().includes(searchLower) ||
      message.lastName.toLowerCase().includes(searchLower) ||
      message.email.toLowerCase().includes(searchLower) ||
      message.subject.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-red-500">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MailOpen className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-blue-500">{stats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold text-green-500">{stats.replied}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-purple-500">{stats.todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Contact Messages</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    fetchMessages()
                    fetchStats()
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No messages match your search.' : 'No contact messages found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.firstName} {message.lastName}</p>
                          {message.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {message.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="truncate">{message.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(message.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {message.status !== 'replied' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReplyMessage(message)}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p>{selectedMessage.firstName} {selectedMessage.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p>{selectedMessage.email}</p>
                </div>
              </div>
              
              {selectedMessage.phone && (
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p>{selectedMessage.phone}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p>{selectedMessage.subject}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="bg-muted p-3 rounded-md">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Received</Label>
                  <p className="text-sm">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>
              
              {selectedMessage.reply && (
                <div>
                  <Label className="text-sm font-medium">Reply</Label>
                  <div className="bg-green-50 p-3 rounded-md border">
                    <p className="whitespace-pre-wrap">{selectedMessage.reply}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Replied on {formatDate(selectedMessage.repliedAt || '')}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                {selectedMessage.status !== 'replied' && (
                  <Button onClick={() => handleReplyMessage(selectedMessage)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
                
                {selectedMessage.status === 'unread' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                  >
                    <MailOpen className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Enter a reply message to send an email to the customer and mark this message as replied. 
              Leave empty to just mark as replied without sending an email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="replyText">Reply Message</Label>
              <Textarea
                id="replyText"
                placeholder="Enter your reply message (optional)..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {replyText.trim() ? 
                  "📧 An email will be sent to the customer with this reply" : 
                  "📝 Message will be marked as replied without sending an email"
                }
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedMessage && handleMarkAsReplied(selectedMessage.id, replyText)}
              >
                {replyText.trim() ? "Send Reply" : "Mark as Replied"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
