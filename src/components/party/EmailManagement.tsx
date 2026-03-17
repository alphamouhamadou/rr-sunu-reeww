'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, Send, Loader2, CheckCircle, AlertTriangle, Plus, Edit, Trash2, 
  Users, Eye, BarChart3, FileText, RefreshCw
} from 'lucide-react'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string | null
  targetGroup: string
  status: string
  sentAt: string | null
  recipientCount: number
  openedCount: number
  clickedCount: number
  createdAt: string
  _count?: {
    logs: number
  }
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string | null
  variables: string | null
  category: string
  isDefault: boolean
  createdAt: string
}

export function EmailManagement() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    id: '',
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    targetGroup: 'all',
  })
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null)
  const [sendingCampaign, setSendingCampaign] = useState(false)
  
  // Template form
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: 'general',
  })
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [campaignsRes, templatesRes] = await Promise.all([
        fetch('/api/email-campaigns'),
        fetch('/api/email-templates'),
      ])
      
      const campaignsData = await campaignsRes.json()
      const templatesData = await templatesRes.json()
      
      setCampaigns(campaignsData.campaigns || [])
      setTemplates(templatesData.templates || [])
    } catch (err) {
      console.error(err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Campaign CRUD
  const handleSaveCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.htmlContent) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      const method = editingCampaign ? 'PATCH' : 'POST'
      const body = editingCampaign 
        ? { id: editingCampaign.id, ...campaignForm }
        : campaignForm
      
      const res = await fetch('/api/email-campaigns', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (editingCampaign) {
          setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? data.campaign : c))
        } else {
          setCampaigns([data.campaign, ...campaigns])
        }
        setCampaignDialogOpen(false)
        setEditingCampaign(null)
        setCampaignForm({ id: '', name: '', subject: '', htmlContent: '', textContent: '', targetGroup: 'all' })
        setSuccess('Campagne sauvegardée')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      console.error(err)
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer cette campagne à tous les destinataires ?')) {
      return
    }
    
    setSendingCampaign(true)
    setError('')
    
    try {
      const res = await fetch('/api/email-campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, action: 'send' })
      })
      
      if (res.ok) {
        const data = await res.json()
        setCampaigns(campaigns.map(c => c.id === campaignId ? data.campaign : c))
        setSuccess(`Campagne envoyée ! ${data.stats?.sent || 0} emails envoyés`)
        setTimeout(() => setSuccess(''), 5000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (err) {
      console.error(err)
      setError('Erreur de connexion')
    } finally {
      setSendingCampaign(false)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return
    
    try {
      const res = await fetch(`/api/email-campaigns?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openCampaignEditor = (campaign?: EmailCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setCampaignForm({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        htmlContent: campaign.htmlContent,
        textContent: campaign.textContent || '',
        targetGroup: campaign.targetGroup,
      })
    } else {
      setEditingCampaign(null)
      setCampaignForm({ id: '', name: '', subject: '', htmlContent: '', textContent: '', targetGroup: 'all' })
    }
    setCampaignDialogOpen(true)
  }

  // Template CRUD
  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.htmlContent) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      const method = editingTemplate ? 'PATCH' : 'POST'
      const body = editingTemplate 
        ? { id: editingTemplate.id, ...templateForm }
        : templateForm
      
      const res = await fetch('/api/email-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (editingTemplate) {
          setTemplates(templates.map(t => t.id === editingTemplate.id ? data.template : t))
        } else {
          setTemplates([data.template, ...templates])
        }
        setTemplateDialogOpen(false)
        setEditingTemplate(null)
        setTemplateForm({ id: '', name: '', subject: '', htmlContent: '', textContent: '', category: 'general' })
        setSuccess('Template sauvegardé')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      console.error(err)
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return
    
    try {
      const res = await fetch(`/api/email-templates?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openTemplateEditor = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateForm({
        id: template.id,
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent || '',
        category: template.category,
      })
    } else {
      setEditingTemplate(null)
      setTemplateForm({ id: '', name: '', subject: '', htmlContent: '', textContent: '', category: 'general' })
    }
    setTemplateDialogOpen(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-500',
      sending: 'bg-blue-500',
      sent: 'bg-green-600',
      failed: 'bg-red-500',
    }
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sending: 'Envoi...',
      sent: 'Envoyé',
      failed: 'Échec',
    }
    return <Badge className={styles[status] || 'bg-gray-500'}>{labels[status] || status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-[#008751]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#008751]/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#008751]" />
              </div>
              <div>
                <CardTitle className="text-[#008751]">Gestion des Emails</CardTitle>
                <CardDescription>
                  Créez et envoyez des newsletters et emails aux membres
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {success && (
        <Alert className="bg-[#008751]/10 border-[#008751]">
          <CheckCircle className="w-4 h-4 text-[#008751]" />
          <AlertDescription className="text-[#008751]">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
          <AlertTriangle className="w-4 h-4 text-[#CE1126]" />
          <AlertDescription className="text-[#CE1126]">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Campagnes
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#008751]">Campagnes Email</CardTitle>
                <CardDescription>Envoyez des newsletters et communications aux membres</CardDescription>
              </div>
              <Button onClick={() => openCampaignEditor()} className="bg-[#008751] hover:bg-[#006b40]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle campagne
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    Aucune campagne créée
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#008751]/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-[#008751]" />
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(campaign.status)}
                            <span className="text-xs text-gray-400">
                              {campaign.targetGroup === 'all' ? 'Tous' : 
                               campaign.targetGroup === 'members' ? 'Membres' :
                               campaign.targetGroup === 'newsletter' ? 'Abonnés' :
                               campaign.targetGroup}
                            </span>
                            {campaign.sentAt && (
                              <span className="text-xs text-gray-400">
                                • {formatDate(campaign.sentAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'sent' && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 mr-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {campaign.recipientCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {campaign.openedCount}
                            </span>
                          </div>
                        )}
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            className="bg-[#008751] hover:bg-[#006b40]"
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sendingCampaign}
                          >
                            {sendingCampaign ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-1" />
                            )}
                            Envoyer
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openCampaignEditor(campaign)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[#CE1126]" 
                          onClick={() => handleDeleteCampaign(campaign.id)}
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

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#008751]">Templates Email</CardTitle>
                <CardDescription>Modèles d'emails réutilisables</CardDescription>
              </div>
              <Button onClick={() => openTemplateEditor()} className="bg-[#008751] hover:bg-[#006b40]">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    Aucun template créé
                  </div>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium dark:text-white">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.subject}</p>
                        <Badge variant="outline" className="mt-1">{template.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openTemplateEditor(template)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[#CE1126]" 
                          onClick={() => handleDeleteTemplate(template.id)}
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
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}</DialogTitle>
            <DialogDescription>
              Créez une campagne email à envoyer aux membres
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de la campagne *</Label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Newsletter Janvier 2024"
                />
              </div>
              <div>
                <Label>Cible</Label>
                <Select 
                  value={campaignForm.targetGroup} 
                  onValueChange={(v) => setCampaignForm(prev => ({ ...prev, targetGroup: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous (membres + abonnés)</SelectItem>
                    <SelectItem value="members">Membres uniquement</SelectItem>
                    <SelectItem value="newsletter">Abonnés newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Objet de l'email *</Label>
              <Input
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ex: Actualités de Renaissance Républicaine"
              />
            </div>
            <div>
              <Label>Contenu HTML *</Label>
              <Textarea
                value={campaignForm.htmlContent}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, htmlContent: e.target.value }))}
                placeholder="<p>Votre contenu ici...</p><p>Utilisez {{name}} pour le nom du destinataire</p>"
                rows={10}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Contenu texte (optionnel)</Label>
              <Textarea
                value={campaignForm.textContent}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, textContent: e.target.value }))}
                placeholder="Version texte brut de l'email..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#008751] hover:bg-[#006b40]" onClick={handleSaveCampaign} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Modifier le template' : 'Nouveau template'}</DialogTitle>
            <DialogDescription>
              Créez un modèle d'email réutilisable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom du template *</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: welcome_email"
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select 
                  value={templateForm.category} 
                  onValueChange={(v) => setTemplateForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Objet *</Label>
              <Input
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Objet de l'email"
              />
            </div>
            <div>
              <Label>Contenu HTML *</Label>
              <Textarea
                value={templateForm.htmlContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, htmlContent: e.target.value }))}
                placeholder="<html>...</html>"
                rows={10}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Contenu texte (optionnel)</Label>
              <Textarea
                value={templateForm.textContent}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, textContent: e.target.value }))}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#008751] hover:bg-[#006b40]" onClick={handleSaveTemplate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
