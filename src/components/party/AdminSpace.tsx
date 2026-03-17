'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { PayTechSettings } from '@/components/party/PayTechSettings'
import { EmailManagement } from '@/components/party/EmailManagement'
import { MemberExportSection, ActivityLogsSection, FinancialReportsSection } from '@/components/party/AdminEnhancedFeatures'
import { 
  Users, BarChart3, Bell, CheckCircle, XCircle, Clock, MapPin, 
  Mail, Phone, Search, Send, Loader2, TrendingUp, DollarSign, UserCheck,
  FileText, Calendar, Plus, Edit, Trash2, Save, AlertTriangle, Radio,
  Youtube, Facebook, Play, ExternalLink, Settings, CreditCard, Eye, EyeOff,
  Download, Activity, Shield, Key, AlertCircle, ImageIcon
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  status: string
  membershipNumber: string | null
  membershipDate: string | null
  hasPaidCard: boolean
  cardPaidAt: string | null
  region?: { name: string } | null
  department?: { name: string } | null
  commune?: { name: string } | null
  createdAt: string
  _count?: {
    contributions: number
    donations: number
  }
}

interface Article {
  id: string
  title: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  category: string
  isFeatured: boolean
  createdAt: string
}

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string
}

interface Stats {
  members: {
    total: number
    pending: number
    approved: number
    byRegion: { region: string; count: number }[]
  }
  donations: {
    total: number
    amount: number
  }
  contributions: {
    total: number
    amount: number
  }
}

interface Region {
  id: string
  name: string
}

interface LiveStream {
  id: string
  title: string
  description: string | null
  platform: string
  streamUrl: string
  streamId: string | null
  thumbnailUrl: string | null
  isLive: boolean
  isScheduled: boolean
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  viewerCount: number
  createdAt: string
}

const COLORS = ['#008751', '#FFD100', '#CE1126', '#3b82f6', '#8b5cf6', '#ec4899']

export function AdminSpace() {
  const { adminSection, setAdminSection } = useAppStore()
  const [members, setMembers] = useState<Member[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  
  // Article form
  const [articleForm, setArticleForm] = useState({
    id: '',
    title: '',
    content: '',
    excerpt: '',
    category: 'actualite',
    isFeatured: false,
    imageUrl: '',
  })
  const [articleDialogOpen, setArticleDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [articleImageUploading, setArticleImageUploading] = useState(false)
  
  // Event form
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    description: '',
    date: '',
    location: '',
  })
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  // Notification form
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    regionId: '',
  })
  const [sendingNotification, setSendingNotification] = useState(false)
  const [notificationSuccess, setNotificationSuccess] = useState(false)
  
  // Save success
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Overdue members for reminders
  const [overdueMembers, setOverdueMembers] = useState<Array<{
    id: string
    name: string
    email: string
    membershipNumber: string
    monthsOverdue: string[]
  }>>([])
  const [remindersLoading, setRemindersLoading] = useState(false)
  const [remindersSent, setRemindersSent] = useState(false)

  // Live streams
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [liveStreamForm, setLiveStreamForm] = useState({
    id: '',
    title: '',
    description: '',
    platform: 'youtube',
    streamUrl: '',
    scheduledAt: '',
  })
  const [liveStreamDialogOpen, setLiveStreamDialogOpen] = useState(false)
  const [editingLiveStream, setEditingLiveStream] = useState<LiveStream | null>(null)

  // Password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordMember, setPasswordMember] = useState<Member | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, statsRes, regionsRes, articlesRes, eventsRes, liveStreamsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/stats'),
          fetch('/api/regions'),
          fetch('/api/articles?limit=50'),
          fetch('/api/events?limit=50'),
          fetch('/api/livestreams'),
        ])
        
        const membersData = await membersRes.json()
        const statsData = await statsRes.json()
        const regionsData = await regionsRes.json()
        const articlesData = await articlesRes.json()
        const eventsData = await eventsRes.json()
        const liveStreamsData = await liveStreamsRes.json()
        
        setMembers(membersData.members || [])
        setStats(statsData)
        setRegions(regionsData.regions || [])
        setArticles(articlesData.articles || [])
        setEvents(eventsData.events || [])
        setLiveStreams(liveStreamsData.streams || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleUpdateMemberStatus = async (memberId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, status })
      })
      
      if (res.ok) {
        setMembers(members.map(m => 
          m.id === memberId ? { ...m, status } : m
        ))
        const statsRes = await fetch('/api/stats')
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member') => {
    const member = members.find(m => m.id === memberId)
    const action = newRole === 'admin' ? 'promouvoir en tant qu\'administrateur' : 'rétrograder en tant que membre'
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} "${member?.firstName} ${member?.lastName}" ?`)) {
      return
    }

    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, role: newRole })
      })
      
      if (res.ok) {
        setMembers(members.map(m => 
          m.id === memberId ? { ...m, role: newRole } : m
        ))
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le membre "${memberName}" ?\n\nCette action est irréversible.`)) {
      return
    }

    try {
      const res = await fetch(`/api/members?id=${memberId}`, { 
        method: 'DELETE' 
      })
      
      if (res.ok) {
        setMembers(members.filter(m => m.id !== memberId))
        const statsRes = await fetch('/api/stats')
        const statsData = await statsRes.json()
        setStats(statsData)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression du membre')
    }
  }

  const openPasswordDialog = (member: Member) => {
    setPasswordMember(member)
    setNewPassword('')
    setPasswordSuccess(false)
    setPasswordDialogOpen(true)
  }

  const handlePasswordChange = async () => {
    if (!passwordMember || !newPassword) return
    
    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/members/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memberId: passwordMember.id, 
          newPassword 
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordSuccess(true)
        setTimeout(() => {
          setPasswordDialogOpen(false)
          setPasswordMember(null)
          setNewPassword('')
          setPasswordSuccess(false)
        }, 2000)
      } else {
        alert(data.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (err) {
      console.error(err)
      alert('Erreur lors du changement de mot de passe')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleMarkCardPaid = async (memberId: string, memberName: string, hasPaid: boolean) => {
    const action = hasPaid ? 'marquer comme non payée' : 'marquer comme payée'
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} la carte de "${memberName}" ?`)) {
      return
    }

    try {
      const res = await fetch('/api/card-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })

      if (res.ok) {
        setMembers(members.map(m => 
          m.id === memberId ? { ...m, hasPaidCard: !hasPaid, cardPaidAt: !hasPaid ? new Date().toISOString() : null } : m
        ))
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleSendNotification = async () => {
    setSendingNotification(true)
    setNotificationSuccess(false)
    
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationForm)
      })
      
      if (res.ok) {
        setNotificationSuccess(true)
        setNotificationForm({ title: '', message: '', regionId: '' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSendingNotification(false)
    }
  }

  // Image upload handler for articles
  const handleArticleImageUpload = async (file: File): Promise<string | null> => {
    setArticleImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'articles')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setArticleForm(prev => ({ ...prev, imageUrl: data.url }))
        return data.url
      }
      return null
    } catch (error) {
      console.error('Image upload error:', error)
      return null
    } finally {
      setArticleImageUploading(false)
    }
  }

  // Article CRUD - CORRIGÉ: spread avant id
  const handleSaveArticle = async () => {
    try {
      const method = editingArticle ? 'PATCH' : 'POST'
      const body = editingArticle 
        ? { ...articleForm, id: editingArticle.id }
        : articleForm
      
      const res = await fetch('/api/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (editingArticle) {
          setArticles(articles.map(a => a.id === editingArticle.id ? data.article : a))
        } else {
          setArticles([data.article, ...articles])
        }
        setArticleDialogOpen(false)
        setEditingArticle(null)
        setArticleForm({ id: '', title: '', content: '', excerpt: '', category: 'actualite', isFeatured: false, imageUrl: '' })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return
    
    try {
      const res = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openArticleEditor = (article?: Article) => {
    if (article) {
      setEditingArticle(article)
      setArticleForm({
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        category: article.category,
        isFeatured: article.isFeatured,
        imageUrl: article.imageUrl || '',
      })
    } else {
      setEditingArticle(null)
      setArticleForm({ id: '', title: '', content: '', excerpt: '', category: 'actualite', isFeatured: false, imageUrl: '' })
    }
    setArticleDialogOpen(true)
  }

  // Event CRUD - CORRIGÉ: spread avant id
  const handleSaveEvent = async () => {
    try {
      const method = editingEvent ? 'PATCH' : 'POST'
      const body = editingEvent 
        ? { ...eventForm, id: editingEvent.id }
        : eventForm
      
      const res = await fetch('/api/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (editingEvent) {
          setEvents(events.map(e => e.id === editingEvent.id ? data.event : e))
        } else {
          setEvents([data.event, ...events])
        }
        setEventDialogOpen(false)
        setEditingEvent(null)
        setEventForm({ id: '', title: '', description: '', date: '', location: '' })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return
    
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openEventEditor = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      setEventForm({
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
      })
    } else {
      setEditingEvent(null)
      setEventForm({ id: '', title: '', description: '', date: '', location: '' })
    }
    setEventDialogOpen(true)
  }

  // Load overdue members
  const loadOverdueMembers = async () => {
    setRemindersLoading(true)
    try {
      const res = await fetch('/api/send-reminder')
      const data = await res.json()
      setOverdueMembers(data.overdueMembers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setRemindersLoading(false)
    }
  }

  // Send reminder to member
  const sendReminder = async (memberId: string) => {
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })
      
      if (res.ok) {
        setRemindersSent(true)
        setTimeout(() => setRemindersSent(false), 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Send all reminders
  const sendAllReminders = async () => {
    setRemindersLoading(true)
    try {
      const res = await fetch('/api/send-reminder?send=true')
      const data = await res.json()
      setRemindersSent(true)
      setTimeout(() => setRemindersSent(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setRemindersLoading(false)
    }
  }

  // Live Stream CRUD - CORRIGÉ: spread avant id
  const handleSaveLiveStream = async () => {
    try {
      const method = editingLiveStream ? 'PATCH' : 'POST'
      const body = editingLiveStream 
        ? { ...liveStreamForm, id: editingLiveStream.id }
        : liveStreamForm
      
      const res = await fetch('/api/livestreams', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (editingLiveStream) {
          setLiveStreams(liveStreams.map(s => s.id === editingLiveStream.id ? data.stream : s))
        } else {
          setLiveStreams([data.stream, ...liveStreams])
        }
        setLiveStreamDialogOpen(false)
        setEditingLiveStream(null)
        setLiveStreamForm({ id: '', title: '', description: '', platform: 'youtube', streamUrl: '', scheduledAt: '' })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteLiveStream = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce live ?')) return
    
    try {
      const res = await fetch(`/api/livestreams?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLiveStreams(liveStreams.filter(s => s.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleLive = async (id: string, goLive: boolean) => {
    try {
      const res = await fetch('/api/livestreams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isLive: goLive })
      })
      
      if (res.ok) {
        const data = await res.json()
        setLiveStreams(liveStreams.map(s => s.id === id ? data.stream : s))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openLiveStreamEditor = (stream?: LiveStream) => {
    if (stream) {
      setEditingLiveStream(stream)
      setLiveStreamForm({
        id: stream.id,
        title: stream.title,
        description: stream.description || '',
        platform: stream.platform,
        streamUrl: stream.streamUrl,
        scheduledAt: stream.scheduledAt ? new Date(stream.scheduledAt).toISOString().slice(0, 16) : '',
      })
    } else {
      setEditingLiveStream(null)
      setLiveStreamForm({ id: '', title: '', description: '', platform: 'youtube', streamUrl: '', scheduledAt: '' })
    }
    setLiveStreamDialogOpen(true)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />
      default:
        return <Radio className="w-4 h-4 text-[#008751]" />
    }
  }

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    const matchesRegion = regionFilter === 'all' || m.region?.name === regionFilter
    
    return matchesSearch && matchesStatus && matchesRegion
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA'
  }

  // Chart data
  const regionChartData = stats?.members.byRegion.slice(0, 6).map(item => ({
    name: item.region || 'Non spécifié',
    value: item.count
  })) || []

  const financialData = stats ? [
    { name: 'Dons', value: stats.donations.amount },
    { name: 'Cotisations', value: stats.contributions.amount },
  ] : []

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#008751]" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="party-gradient text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-green-100">Gestion de la plateforme RR Sunu Reew</p>
        </div>
      </section>

      {saveSuccess && (
        <div className="container mx-auto px-4 mt-4">
          <Alert className="bg-[#008751]/10 border-[#008751]">
            <CheckCircle className="w-4 h-4 text-[#008751]" />
            <AlertDescription className="text-[#008751]">
              Modifications enregistrées avec succès !
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Tabs value={adminSection} onValueChange={(v) => setAdminSection(v as typeof adminSection)}>
          <TabsList className="grid w-full grid-cols-12 mb-8">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Membres</span>
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Contenu</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Événements</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Galerie</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="finances" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Finances</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Rappels</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#008751]">Gestion des Adhérents</CardTitle>
                <CardDescription>Validez et gérez les comptes membres</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Validés</SelectItem>
                      <SelectItem value="rejected">Rejetés</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      {regions.map(r => (
                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Members List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun membre trouvé
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#008751]/10 flex items-center justify-center font-bold text-[#008751]">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{member.firstName} {member.lastName}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {member.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {member.phone}
                              </span>
                              {member.region && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {member.region.name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Inscrit le {formatDate(member.createdAt)}
                              {member.membershipNumber && ` • N° ${member.membershipNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Role Badge */}
                          <Badge variant="outline" className={
                            member.role === 'admin' 
                              ? 'border-purple-500 text-purple-600' 
                              : 'border-gray-400 text-gray-600'
                          }>
                            {member.role === 'admin' ? 'Admin' : 'Membre'}
                          </Badge>
                          {/* Status Badge */}
                          <Badge className={
                            member.status === 'approved' ? 'bg-[#008751]' :
                            member.status === 'pending' ? 'bg-[#FFD100] text-black' :
                            'bg-[#CE1126]'
                          }>
                            {member.status === 'approved' ? 'Validé' :
                             member.status === 'pending' ? 'En attente' : 'Rejeté'}
                          </Badge>
                          {/* Card Payment Badge */}
                          {member.status === 'approved' && (
                            <Badge className={
                              member.hasPaidCard ? 'bg-blue-600' : 'bg-gray-400'
                            }>
                              {member.hasPaidCard ? 'Carte payée' : 'Carte impayée'}
                            </Badge>
                          )}
                          {member.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#008751] text-[#008751] hover:bg-[#008751] hover:text-white"
                                onClick={() => handleUpdateMemberStatus(member.id, 'approved')}
                                title="Valider"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[#CE1126] text-[#CE1126] hover:bg-[#CE1126] hover:text-white"
                                onClick={() => handleUpdateMemberStatus(member.id, 'rejected')}
                                title="Rejeter"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {/* Role Change Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-500 hover:bg-purple-500/10"
                            onClick={() => handleChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                            title={member.role === 'admin' ? 'Rétrograder en membre' : 'Promouvoir admin'}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          {/* Card Payment Button - only for approved members */}
                          {member.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className={member.hasPaidCard ? 'text-blue-500 hover:bg-blue-500/10' : 'text-gray-400 hover:bg-gray-500/10'}
                              onClick={() => handleMarkCardPaid(member.id, `${member.firstName} ${member.lastName}`, member.hasPaidCard)}
                              title={member.hasPaidCard ? 'Marquer carte non payée' : 'Marquer carte payée'}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          {/* Password Change Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-500 hover:bg-amber-500/10"
                            onClick={() => openPasswordDialog(member)}
                            title="Modifier le mot de passe"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-[#CE1126] hover:bg-[#CE1126]/10"
                            onClick={() => handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="exports">
            <MemberExportSection 
              members={members} 
              onRefresh={async () => {
                const res = await fetch('/api/members')
                const data = await res.json()
                setMembers(data.members || [])
              }} 
            />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#008751]">Gestion du Contenu</CardTitle>
                  <CardDescription>Articles et actualités</CardDescription>
                </div>
                <Button onClick={() => openArticleEditor()} className="bg-[#008751] hover:bg-[#006b40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel article
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun article
                    </div>
                  ) : (
                    articles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium dark:text-white">{article.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{article.category}</Badge>
                            {article.isFeatured && (
                              <Badge className="bg-[#FFD100] text-black">À la une</Badge>
                            )}
                            <span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openArticleEditor(article)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-[#CE1126]" onClick={() => handleDeleteArticle(article.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#008751]">Gestion des Événements</CardTitle>
                  <CardDescription>Meetings et activités</CardDescription>
                </div>
                <Button onClick={() => openEventEditor()} className="bg-[#008751] hover:bg-[#006b40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel événement
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun événement
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium dark:text-white">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.date)}
                            <MapPin className="w-3 h-3 ml-2" />
                            {event.location}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEventEditor(event)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-[#CE1126]" onClick={() => handleDeleteEvent(event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#008751]">Galerie Photos</CardTitle>
                  <CardDescription>Gérez les photos du parti</CardDescription>
                </div>
                <Button className="bg-[#008751] hover:bg-[#006b40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une photo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Sample placeholder for gallery */}
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Ajouter une photo</p>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-500 mt-8 py-8">
                  Importez des photos pour les afficher dans la galerie publique.
                  <br />
                  <span className="text-sm">Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)</span>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Streams Tab */}
          <TabsContent value="live">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#008751]">Diffusions en Direct</CardTitle>
                  <CardDescription>Gérez les lives YouTube et Facebook</CardDescription>
                </div>
                <Button onClick={() => openLiveStreamEditor()} className="bg-[#008751] hover:bg-[#006b40]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau live
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveStreams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Radio className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      Aucun live configuré
                    </div>
                  ) : (
                    liveStreams.map((stream) => (
                      <div 
                        key={stream.id} 
                        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border-2 ${
                          stream.isLive 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                            : 'bg-gray-50 dark:bg-gray-800 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {getPlatformIcon(stream.platform)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium dark:text-white">{stream.title}</p>
                              {stream.isLive && (
                                <Badge className="bg-red-600 text-white animate-pulse">
                                  EN DIRECT
                                </Badge>
                              )}
                              {stream.isScheduled && !stream.isLive && !stream.endedAt && (
                                <Badge className="bg-[#FFD100] text-black">
                                  Programmé
                                </Badge>
                              )}
                              {stream.endedAt && (
                                <Badge variant="outline">
                                  Terminé
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              {getPlatformIcon(stream.platform)}
                              <span className="capitalize">{stream.platform}</span>
                              {stream.scheduledAt && (
                                <>
                                  <span>•</span>
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(stream.scheduledAt)}
                                </>
                              )}
                              {stream.viewerCount > 0 && stream.isLive && (
                                <>
                                  <span>•</span>
                                  <span>{stream.viewerCount} spectateurs</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(stream.streamUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {!stream.isLive && !stream.endedAt && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleToggleLive(stream.id, true)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Démarrer
                            </Button>
                          )}
                          {stream.isLive && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleToggleLive(stream.id, false)}
                            >
                              Arrêter
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => openLiveStreamEditor(stream)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-[#CE1126]" 
                            onClick={() => handleDeleteLiveStream(stream.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finances Tab */}
          <TabsContent value="finances">
            <FinancialReportsSection />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            {stats && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Membres</p>
                          <p className="text-3xl font-bold text-[#008751]">{stats.members.total}</p>
                        </div>
                        <Users className="w-10 h-10 text-[#008751]/20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">En attente</p>
                          <p className="text-3xl font-bold text-[#FFD100]">{stats.members.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-[#FFD100]/20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Dons reçus</p>
                          <p className="text-2xl font-bold text-[#008751]">{formatAmount(stats.donations.amount)}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-[#008751]/20" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Cotisations</p>
                          <p className="text-2xl font-bold text-[#008751]">{formatAmount(stats.contributions.amount)}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-[#008751]/20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#008751]">Répartition par Région</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={regionChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis />
                            <Bar dataKey="value" fill="#008751" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#008751]">Finances</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={financialData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                              {financialData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#008751]">Taux de Conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-5xl font-bold text-[#008751] mb-2">
                        {stats.members.total > 0 
                          ? ((stats.members.approved / stats.members.total) * 100).toFixed(0)
                          : 0}%
                      </div>
                      <p className="text-gray-500">Taux d'approbation</p>
                      <div className="mt-4 flex justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#008751]" />
                          Validés: {stats.members.approved}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#FFD100]" />
                          En attente: {stats.members.pending}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs">
            <ActivityLogsSection />
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#008751]">Rappels de Cotisations</CardTitle>
                  <CardDescription>Membres avec cotisations en retard</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={loadOverdueMembers}
                    disabled={remindersLoading}
                  >
                    {remindersLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Rechercher
                  </Button>
                  {overdueMembers.length > 0 && (
                    <Button 
                      className="bg-[#008751] hover:bg-[#006b40]"
                      onClick={sendAllReminders}
                      disabled={remindersLoading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer tous les rappels
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {remindersSent && (
                  <Alert className="mb-4 bg-[#008751]/10 border-[#008751]">
                    <CheckCircle className="w-4 h-4 text-[#008751]" />
                    <AlertDescription className="text-[#008751]">
                      Rappel(s) envoyé(s) avec succès !
                    </AlertDescription>
                  </Alert>
                )}

                {overdueMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                      Cliquez sur "Rechercher" pour trouver les membres avec cotisations en retard
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="bg-[#FFD100]/10 border-[#FFD100]">
                      <AlertTriangle className="w-4 h-4 text-[#FFD100]" />
                      <AlertDescription>
                        <strong>{overdueMembers.length}</strong> membre(s) ont des cotisations en retard (3 derniers mois)
                      </AlertDescription>
                    </Alert>
                    
                    {overdueMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium dark:text-white">{member.name}</p>
                          <p className="text-sm text-gray-500">
                            N° {member.membershipNumber} • {member.email}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {member.monthsOverdue.map((month, idx) => (
                              <Badge key={idx} variant="outline" className="border-[#CE1126] text-[#CE1126]">
                                {month}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#008751] hover:bg-[#006b40]"
                          onClick={() => sendReminder(member.id)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Envoyer rappel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#008751]">Envoyer une Notification</CardTitle>
                <CardDescription>Envoyez des alertes aux membres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationSuccess && (
                  <Alert className="bg-[#008751]/10 border-[#008751]">
                    <CheckCircle className="w-4 h-4 text-[#008751]" />
                    <AlertDescription className="text-[#008751]">
                      Notification envoyée avec succès !
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de la notification"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Contenu de la notification"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Ciblage géographique</Label>
                  <Select 
                    value={notificationForm.regionId} 
                    onValueChange={(v) => setNotificationForm(prev => ({ ...prev, regionId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les régions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les régions</SelectItem>
                      {regions.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-[#008751] hover:bg-[#006b40]"
                  onClick={handleSendNotification}
                  disabled={sendingNotification || !notificationForm.title || !notificationForm.message}
                >
                  {sendingNotification ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer la notification
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab - Campaigns & Templates */}
          <TabsContent value="emails">
            <EmailManagement />
          </TabsContent>

          {/* Settings Tab - PayTech & SMTP Configuration */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* SMTP Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#008751] flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Configuration Email (SMTP)
                  </CardTitle>
                  <CardDescription>
                    Configurez le service d'envoi d'emails pour les notifications et la réinitialisation des mots de passe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Configurez les variables SMTP dans le fichier <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> sur le serveur.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Variables requises:</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li><code className="text-xs">SMTP_HOST</code> - Serveur SMTP</li>
                        <li><code className="text-xs">SMTP_PORT</code> - Port (587, 465)</li>
                        <li><code className="text-xs">SMTP_USER</code> - Nom d'utilisateur</li>
                        <li><code className="text-xs">SMTP_PASS</code> - Mot de passe</li>
                        <li><code className="text-xs">SMTP_FROM</code> - Email expéditeur</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Services compatibles:</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>✅ Gmail (avec mot de passe d'application)</li>
                        <li>✅ SendGrid</li>
                        <li>✅ Mailgun</li>
                        <li>✅ Amazon SES</li>
                        <li>✅ OVH, Ionos, etc.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/smtp-test')
                          const data = await res.json()
                          alert(data.message)
                        } catch {
                          alert('Erreur lors du test de connexion')
                        }
                      }}
                    >
                      Tester la connexion
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PayTech Configuration */}
              <PayTechSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Dialog */}
      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'article"
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={articleForm.category} onValueChange={(v) => setArticleForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actualite">Actualité</SelectItem>
                  <SelectItem value="communique">Communiqué</SelectItem>
                  <SelectItem value="evenement">Événement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image de couverture</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      await handleArticleImageUpload(file)
                    }}
                  }
                  className="flex-1"
                />
                {articleImageUploading && <Loader2 className="w-5 h-5 animate-spin text-[#008751]" />}
              </div>
              {articleForm.imageUrl && (
                <div className="mt-2 relative inline-block">
                  <img 
                    src={articleForm.imageUrl} 
                    alt="Aperçu" 
                    className="h-24 w-auto rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setArticleForm(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <Label>Résumé</Label>
              <Input
                value={articleForm.excerpt}
                onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Bref résumé de l'article"
              />
            </div>
            <div>
              <Label>Contenu *</Label>
              <Textarea
                value={articleForm.content}
                onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenu complet de l'article. Vous pouvez utiliser du HTML pour le formatage (gras: &lt;b&gt;, italique: &lt;i&gt;, listes: &lt;ul&gt;&lt;li&gt;)"
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatage HTML supporté: &lt;b&gt;gras&lt;/b&gt;, &lt;i&gt;italique&lt;/i&gt;, &lt;ul&gt;&lt;li&gt;liste&lt;/li&gt;&lt;/ul&gt;, &lt;a href="..."&gt;lien&lt;/a&gt;
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={articleForm.isFeatured}
                onChange={(e) => setArticleForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="featured">Afficher à la une</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticleDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#008751] hover:bg-[#006b40]" onClick={handleSaveArticle}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}</DialogTitle>
            <DialogDescription>
              Planifiez un événement du parti
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'événement"
              />
            </div>
            <div>
              <Label>Date et heure *</Label>
              <Input
                type="datetime-local"
                value={eventForm.date}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Lieu *</Label>
              <Input
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Adresse ou ville"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Détails de l'événement"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#008751] hover:bg-[#006b40]" onClick={handleSaveEvent}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Stream Dialog */}
      <Dialog open={liveStreamDialogOpen} onOpenChange={setLiveStreamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLiveStream ? 'Modifier le live' : 'Nouveau live'}</DialogTitle>
            <DialogDescription>
              Configurez une diffusion en direct
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={liveStreamForm.title}
                onChange={(e) => setLiveStreamForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Grand Meeting de Dakar"
              />
            </div>
            <div>
              <Label>Plateforme *</Label>
              <Select 
                value={liveStreamForm.platform} 
                onValueChange={(v) => setLiveStreamForm(prev => ({ ...prev, platform: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL du stream *</Label>
              <Input
                value={liveStreamForm.streamUrl}
                onChange={(e) => setLiveStreamForm(prev => ({ ...prev, streamUrl: e.target.value }))}
                placeholder={liveStreamForm.platform === 'youtube' 
                  ? 'https://www.youtube.com/watch?v=...' 
                  : 'https://www.facebook.com/.../videos/...'
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {liveStreamForm.platform === 'youtube' 
                  ? 'Collez l\'URL YouTube de votre live ou vidéo' 
                  : 'Collez l\'URL Facebook de votre live'}
              </p>
            </div>
            <div>
              <Label>Date et heure (optionnel)</Label>
              <Input
                type="datetime-local"
                value={liveStreamForm.scheduledAt}
                onChange={(e) => setLiveStreamForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Pour programmer une diffusion à l'avance
              </p>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={liveStreamForm.description}
                onChange={(e) => setLiveStreamForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du live..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiveStreamDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-[#008751] hover:bg-[#006b40]" 
              onClick={handleSaveLiveStream}
              disabled={!liveStreamForm.title || !liveStreamForm.streamUrl}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              Modifier le mot de passe
            </DialogTitle>
            <DialogDescription>
              {passwordMember && (
                <span>
                  Modifier le mot de passe de <strong>{passwordMember.firstName} {passwordMember.lastName}</strong> ({passwordMember.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {passwordSuccess ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Mot de passe modifié avec succès !</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-white" 
                  onClick={handlePasswordChange}
                  disabled={!newPassword || newPassword.length < 6 || passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Modifier
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}