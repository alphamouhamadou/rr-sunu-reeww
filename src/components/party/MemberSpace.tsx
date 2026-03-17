'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, CreditCard, MessageSquare, Clock, MapPin, Phone, Mail, 
  Calendar, Download, Eye, CheckCircle, AlertCircle, Loader2,
  Camera
} from 'lucide-react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'

interface Contribution {
  id: string
  amount: number
  month: string
  paymentMethod: string
  paymentRef: string | null
  status: string
  createdAt: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

const CARD_FEE = 2000
const MONTHLY_CONTRIBUTION = 5000

export function MemberSpace() {
  const { member, setCurrentSection, memberSection, setMemberSection } = useAppStore()
  const [qrCode, setQrCode] = useState('')
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (member?.membershipNumber) {
      QRCode.toDataURL(member.membershipNumber, {
        width: 200,
        margin: 2,
        color: { dark: '#008751', light: '#ffffff' }
      }).then(setQrCode)
    }

    const fetchData = async () => {
      if (member?.id) {
        try {
          const contribRes = await fetch(`/api/contributions?memberId=${member.id}`)
          const contribData = await contribRes.json()
          setContributions(contribData.contributions || [])

          const notifRes = await fetch(`/api/notifications?memberId=${member.id}`)
          const notifData = await notifRes.json()
          setNotifications(notifData.notifications || [])
        } catch (error) {
          console.error(error)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [member])

  const initiatePayTechPayment = async (type: 'contribution' | 'card_fee', amount: number) => {
    setPaymentLoading(true)
    setPaymentError('')

    try {
      const res = await fetch('/api/paytech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type,
          itemName: type === 'contribution' ? 'Cotisation mensuelle' : 'Carte de membre',
          customerEmail: member?.email,
          customerPhone: member?.phone,
          memberId: member?.id,
        })
      })

      const data = await res.json()

      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank')
      } else {
        setPaymentError(data.error || 'Erreur lors de l\'initialisation du paiement')
      }
    } catch (error) {
      console.error(error)
      setPaymentError('Erreur de connexion au service de paiement')
    } finally {
      setPaymentLoading(false)
    }
  }

  const downloadCardAsPDF = async () => {
  if (!member) return

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98]
    })
    
    const pageWidth = 85.6
    const pageHeight = 53.98
    
    // Helper pour charger une image en base64
    const loadImageAsBase64 = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = reject
        img.src = url
      })
    }

    // Calculer la date d'expiration (5 ans après l'adhésion)
    const calculateExpiryDate = (membershipDate: string | Date): Date => {
      const date = new Date(membershipDate)
      date.setFullYear(date.getFullYear() + 5)
      return date
    }
    
    // Header vert
    pdf.setFillColor(0, 135, 81)
    pdf.rect(0, 0, pageWidth, 18, 'F')
    
    // Dégradé simulé
    pdf.setFillColor(0, 107, 64)
    pdf.rect(60, 0, 25.6, 18, 'F')
    
    // Titre
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Renaissance Républicaine', 4, 7)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(187, 247, 208)
    pdf.text('Sunu Reew', 4, 12)
    
    // Logo en haut AVEC cercle blanc
    try {
      const logoBase64 = await loadImageAsBase64('/logo.png')
      // Fond circulaire blanc
      pdf.setFillColor(255, 255, 255)
      pdf.circle(pageWidth - 12, 9, 9, 'F')
      // Logo
      pdf.addImage(logoBase64, 'PNG', pageWidth - 21, 0, 18, 18)
    } catch (e) {
      pdf.setFillColor(255, 255, 255)
      pdf.circle(pageWidth - 12, 9, 8, 'F')
      pdf.setTextColor(0, 135, 81)
      pdf.setFontSize(15)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RR', pageWidth - 12, 12, { align: 'center' })
    }
    
    // Corps blanc
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 18, pageWidth, pageHeight - 18, 'F')
    
    // Photo du membre
    if (member.photo) {
      try {
        const photoBase64 = await loadImageAsBase64(member.photo)
        pdf.addImage(photoBase64, 'PNG', 4, 21, 18, 22)
      } catch (e) {
        pdf.setFillColor(243, 244, 246)
        pdf.roundedRect(4, 21, 18, 22, 2, 2, 'F')
      }
    } else {
      pdf.setFillColor(243, 244, 246)
      pdf.roundedRect(4, 21, 18, 22, 2, 2, 'F')
    }
    
    // Bordure photo
    pdf.setDrawColor(0, 135, 81)
    pdf.setLineWidth(0.3)
    pdf.roundedRect(4, 21, 18, 22, 2, 2, 'S')
    
    // Nom
    pdf.setTextColor(156, 163, 175)
    pdf.setFontSize(5)
    pdf.text('NOM', 25, 24)
    pdf.setTextColor(17, 24, 39)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${member.firstName} ${member.lastName}`, 25, 28)
    
    // N° Membre
    pdf.setTextColor(156, 163, 175)
    pdf.setFontSize(5)
    pdf.setFont('helvetica', 'normal')
    pdf.text('N° MEMBRE', 25, 33)
    pdf.setTextColor(0, 135, 81)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text(member.membershipNumber || 'En attente', 25, 37)
    
    // Téléphone
    pdf.setTextColor(156, 163, 175)
    pdf.setFontSize(5)
    pdf.setFont('helvetica', 'normal')
    pdf.text('TÉLÉPHONE', 25, 41)
    pdf.setTextColor(55, 65, 81)
    pdf.setFontSize(7)
    pdf.text(member.phone || 'N/A', 25, 44)
    
    // Ligne séparatrice du bas
    //pdf.setDrawColor(243, 244, 246)
    pdf.line(4, 46, pageWidth - 4, 46)
    
   // DÉPARTEMENT | COMMUNE | MEMBRE DEPUIS | EXPIRE LE sur la même ligne
pdf.setTextColor(156, 163, 175)
pdf.setFontSize(4.5)
pdf.setFont('helvetica', 'normal')
pdf.text('DÉPARTEMENT', 4, 49)
pdf.text('COMMUNE', 26, 49)
pdf.text('MEMBRE DEPUIS', 48, 49)
pdf.text('EXPIRE LE', 70, 49)

// Valeurs correspondantes
pdf.setTextColor(31, 41, 55)
pdf.setFontSize(5.5)
pdf.text(member.department?.name || member.cityAbroad || 'N/A', 4, 52)
pdf.text(member.commune?.name || member.country || 'N/A', 26, 52)
pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', 48, 52)

// Date d'expiration (5 ans après adhésion)
if (member.membershipDate) {
  const expiryDate = calculateExpiryDate(member.membershipDate)
  pdf.text(expiryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 70, 52)
} else {
  pdf.text('En attente', 70, 52)
}
    
    // QR Code
    if (qrCode) {
      pdf.addImage(qrCode, 'PNG', pageWidth - 18, 33, 12, 12)
    }
    
    pdf.save(`carte-membre-${member.membershipNumber}.pdf`)
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de la génération du PDF')
  }
}

  const downloadReceipt = async (contributionId: string) => {
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionId })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du reçu')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recu-cotisation-${contributionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur téléchargement reçu:', error)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPaid = contributions.some(c => c.month === currentMonth && c.status === 'completed')

  if (!member) {
    setCurrentSection('login')
    return null
  }

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
      <section className="party-gradient text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bienvenue, {member.firstName} {member.lastName}</h1>
              <p className="text-green-100">Membre #{member.membershipNumber || 'En attente'}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={memberSection} onValueChange={(v) => setMemberSection(v as typeof memberSection)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" />Profil</TabsTrigger>
            <TabsTrigger value="card"><CreditCard className="w-4 h-4 mr-1" />Carte</TabsTrigger>
            <TabsTrigger value="contributions"><Clock className="w-4 h-4 mr-1" />Cotisations</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 mr-1" />Messages</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#008751]">Mes Informations</CardTitle>
                <CardDescription>Vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#008751]" />
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium dark:text-white">{member.firstName} {member.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#008751]" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium dark:text-white">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#008751]" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium dark:text-white">{member.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#008751]" />
                      <div>
                        <p className="text-sm text-gray-500">Région</p>
                        <p className="font-medium dark:text-white">{member.region?.name || 'Non renseignée'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#008751]" />
                      <div>
                        <p className="text-sm text-gray-500">Membre depuis</p>
                        <p className="font-medium dark:text-white">{member.membershipDate ? formatDate(member.membershipDate) : 'En attente'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#008751]" />
                      <div>
                        <p className="text-sm text-gray-500">N° de carte</p>
                        <p className="font-medium dark:text-white">{member.membershipNumber || 'En attente'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Badge className={member.status === 'approved' ? 'bg-[#008751]' : member.status === 'pending' ? 'bg-[#FFD100] text-black' : 'bg-[#CE1126]'}>
                    {member.status === 'approved' ? 'Membre validé' : member.status === 'pending' ? 'En attente' : 'Compte rejeté'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Card Tab */}
          <TabsContent value="card">
            <div className="max-w-md mx-auto space-y-6">
              <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="party-gradient p-4 text-white relative">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h2 className="text-lg font-bold">Renaissance Républicaine</h2>
                      <p className="text-green-200 text-sm">Sunu Reew</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">RR</div>
                  </div>
                </div>
                <CardContent className="p-4 bg-white">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-28 rounded-lg overflow-hidden border-2 border-[#008751]/20 bg-gray-100 flex items-center justify-center shadow-md">
                        {member.photo ? (
                          <img src={member.photo} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-[#008751]/10 to-[#008751]/20 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-[#008751]/40" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-gray-400 uppercase">Nom</p>
                      <p className="font-bold text-gray-900 text-lg">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-gray-400 uppercase">N° Membre</p>
                      <p className="font-semibold text-[#008751]">{member.membershipNumber || 'En attente'}</p>
                      <p className="text-xs text-gray-400 uppercase">Téléphone</p>
                      <p className="text-sm text-gray-700">{member.phone}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Département</p>
                        <p className="font-medium text-gray-800">{member.department?.name || member.cityAbroad || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Commune</p>
                        <p className="font-medium text-gray-800">{member.commune?.name || member.country || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Membre depuis</p>
                      <p className="text-sm font-medium text-gray-700">{member.membershipDate ? formatDate(member.membershipDate) : 'En attente'}</p>
                    </div>
                    {qrCode && (
                      <div className="bg-white p-1 rounded">
                        <img src={qrCode} alt="QR Code" className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              {paymentError && (
                <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
                  <AlertCircle className="w-4 h-4 text-[#CE1126]" />
                  <AlertDescription className="text-[#CE1126]">{paymentError}</AlertDescription>
                </Alert>
              )}

              {/* Card Payment Status */}
              {member?.hasPaidCard ? (
                <Alert className="bg-[#008751]/10 border-[#008751]">
                  <CheckCircle className="w-4 h-4 text-[#008751]" />
                  <AlertDescription className="text-[#008751]">
                    Carte payée {member.cardPaidAt && `le ${formatDate(member.cardPaidAt)}`}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-[#FFD100]/10 border-[#FFD100]">
                  <AlertCircle className="w-4 h-4 text-[#FFD100]" />
                  <AlertDescription className="text-amber-700">
                    Vous devez payer votre carte ({formatAmount(CARD_FEE)}) pour la télécharger
                  </AlertDescription>
                </Alert>
              )}

              {/* SEUL bouton de téléchargement PDF */}
              <div className="space-y-3">
                {member?.hasPaidCard && qrCode && (
                  <Button className="w-full bg-[#008751] hover:bg-[#006b40]" onClick={downloadCardAsPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger en PDF
                  </Button>
                )}
                
                {!member?.hasPaidCard && (
                  <Button variant="outline" className="w-full border-[#008751] text-[#008751] hover:bg-[#008751] hover:text-white" onClick={() => initiatePayTechPayment('card_fee', CARD_FEE)} disabled={paymentLoading}>
                    {paymentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    Payer la carte ({formatAmount(CARD_FEE)})
                  </Button>
                )}
              </div>

              {!qrCode && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>Votre carte sera disponible après validation</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#008751]">Mes Cotisations</CardTitle>
                <CardDescription>Historique de vos cotisations mensuelles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg mb-6 ${currentMonthPaid ? 'bg-[#008751]/10' : 'bg-[#FFD100]/10'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{currentMonthPaid ? 'Cotisation payée' : 'Cotisation impayée'}</p>
                      <p className="text-sm text-gray-500">{formatMonth(currentMonth)} - {formatAmount(MONTHLY_CONTRIBUTION)}</p>
                    </div>
                    {!currentMonthPaid && (
                      <Button className="bg-[#008751] hover:bg-[#006b40]" onClick={() => initiatePayTechPayment('contribution', MONTHLY_CONTRIBUTION)} disabled={paymentLoading}>
                        {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Payer'}
                      </Button>
                    )}
                  </div>
                </div>

                {contributions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune cotisation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contributions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.status === 'completed' ? 'bg-[#008751]/10' : 'bg-[#FFD100]/10'}`}>
                            {c.status === 'completed' ? <CheckCircle className="w-5 h-5 text-[#008751]" /> : <Clock className="w-5 h-5 text-[#FFD100]" />}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{formatMonth(c.month)}</p>
                            <p className="text-sm text-gray-500 capitalize">{c.paymentMethod.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-[#008751]">{formatAmount(c.amount)}</p>
                            <Badge variant="outline" className={c.status === 'completed' ? 'border-[#008751] text-[#008751]' : 'border-[#FFD100]'}>
                              {c.status === 'completed' ? 'Payé' : 'En attente'}
                            </Badge>
                          </div>
                          {c.status === 'completed' && (
                            <Button variant="outline" size="sm" onClick={() => downloadReceipt(c.id)} className="border-[#008751] text-[#008751]">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <Button className="w-full bg-[#008751] hover:bg-[#006b40]" onClick={() => initiatePayTechPayment('contribution', MONTHLY_CONTRIBUTION)} disabled={paymentLoading}>
                    {paymentLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</> : <><CreditCard className="w-4 h-4 mr-2" />Payer ({formatAmount(MONTHLY_CONTRIBUTION)})</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#008751]">Notifications</CardTitle>
                <CardDescription>Messages et annonces</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 rounded-lg border ${n.isRead ? 'bg-gray-50 dark:bg-gray-800' : 'bg-[#008751]/5 border-[#008751]/20'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium dark:text-white">{n.title}</p>
                              {!n.isRead && <Badge className="bg-[#008751] text-xs">Nouveau</Badge>}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{formatDate(n.createdAt)}</p>
                          </div>
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}