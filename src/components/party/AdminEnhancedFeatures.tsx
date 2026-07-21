'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  Download, FileSpreadsheet, FileText, CheckCircle, XCircle, Trash2, 
  Loader2, Users, Shield, Activity, DollarSign, TrendingUp, Filter,
  CheckSquare, Square
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  status: string
  membershipNumber: string | null
  region?: { name: string } | null
  createdAt: string
}

interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  details: string | null
  createdAt: string
  member?: {
    firstName: string
    lastName: string
    email: string
  } | null
}

interface FinancialStats {
  summary: {
    totalDonations: number
    completedDonations: number
    totalDonationAmount: number
    totalContributions: number
    completedContributions: number
    totalContributionAmount: number
    totalAmount: number
    averageDonation: number
    averageContribution: number
  }
  byPaymentMethod: {
    wave: { donations: number; contributions: number; count: number }
    orange_money: { donations: number; contributions: number; count: number }
  }
  chartData: Array<{
    month: string
    donations: number
    contributions: number
    total: number
  }>
  topDonors: Array<{
    name: string
    email: string
    total: number
    count: number
  }>
}

interface MemberExportProps {
  members: Member[]
  onRefresh: () => void
}

export function MemberExportSection({ members, onRefresh }: MemberExportProps) {
  const [exporting, setExporting] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const pendingMembers = members.filter(m => m.status === 'pending')
  const approvedMembers = members.filter(m => m.status === 'approved')

  const toggleMemberSelection = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const toggleAllMembers = (status: string) => {
    const membersToSelect = members.filter(m => m.status === status).map(m => m.id)
    if (selectedMembers.length === membersToSelect.length && membersToSelect.every(id => selectedMembers.includes(id))) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(membersToSelect)
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export/members?format=excel')
      
      if (!res.ok) {
        throw new Error('Erreur lors de l\'export')
      }
      
      // Get the Excel file as blob
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `membres-rr-sunu-reew-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l\'export Excel')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      // Fetch data for PDF
      const res = await fetch('/api/export/members?format=pdf')
      
      if (!res.ok) {
        throw new Error('Erreur lors de l\'export')
      }
      
      const data = await res.json()
      
      // Dynamic import for jsPDF
      const { jsPDF } = await import('jspdf')
      const jsPDFAutoTable = await import('jspdf-autotable')
      
      const doc = new jsPDF('l', 'mm', 'a4')
      
      // Title
      doc.setFontSize(18)
      doc.setTextColor(0, 135, 81)
      doc.text('Liste des Membres - Renaissance Républicaine Sunu Reew', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} - ${data.total} membres`, 14, 28)
      
      // Prepare table data
      const tableData = data.members.map((m: any) => [
        m.index,
        m.membershipNumber,
        m.firstName,
        m.lastName,
        m.email,
        m.phone,
        m.region,
        m.role,
        m.status,
      ])
      
      jsPDFAutoTable.default(doc, {
        head: [['N°', 'N° Adhérent', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Région', 'Rôle', 'Statut']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 135, 81] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })
      
      doc.save(`membres-rr-sunu-reew-${new Date().toISOString().split('T')[0]}.pdf`)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l\'export PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedMembers.length === 0) return
    
    setBulkLoading(true)
    try {
      const res = await fetch('/api/members/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          memberIds: selectedMembers,
          data: bulkAction === 'changeRole' ? { role: 'member' } : undefined
        })
      })
      
      if (res.ok) {
        setSelectedMembers([])
        setBulkDialogOpen(false)
        onRefresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {exportSuccess && (
        <Alert className="bg-[#008751]/10 border-[#008751]">
          <CheckCircle className="w-4 h-4 text-[#008751]" />
          <AlertDescription className="text-[#008751]">
            Export réussi !
          </AlertDescription>
        </Alert>
      )}

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#008751] flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter les Membres
          </CardTitle>
          <CardDescription>
            Téléchargez la liste des membres en Excel ou PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleExportExcel}
              disabled={exporting}
              className="bg-[#008751] hover:bg-[#006b40]"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Exporter Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={exporting}
              variant="outline"
              className="border-[#008751] text-[#008751]"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Exporter PDF
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {members.length} membres au total
          </p>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#008751] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Actions Groupées
          </CardTitle>
          <CardDescription>
            Sélectionnez des membres et effectuez des actions en lot
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleAllMembers('pending')}
              className={selectedMembers.length === pendingMembers.length && pendingMembers.length > 0 ? 'bg-[#FFD100] text-black' : ''}
            >
              {selectedMembers.length === pendingMembers.length && pendingMembers.length > 0 ? (
                <CheckSquare className="w-4 h-4 mr-1" />
              ) : (
                <Square className="w-4 h-4 mr-1" />
              )}
              En attente ({pendingMembers.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleAllMembers('approved')}
              className={selectedMembers.length === approvedMembers.length && approvedMembers.length > 0 ? 'bg-[#008751] text-white' : ''}
            >
              {selectedMembers.length === approvedMembers.length && approvedMembers.length > 0 ? (
                <CheckSquare className="w-4 h-4 mr-1" />
              ) : (
                <Square className="w-4 h-4 mr-1" />
              )}
              Validés ({approvedMembers.length})
            </Button>
          </div>

          {/* Selected Members List */}
          {selectedMembers.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium mb-2">
                {selectedMembers.length} membre(s) sélectionné(s)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-[#008751] hover:bg-[#006b40]"
                  onClick={() => { setBulkAction('approve'); setBulkDialogOpen(true) }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valider tout
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#CE1126] text-[#CE1126] hover:bg-[#CE1126] hover:text-white"
                  onClick={() => { setBulkAction('reject'); setBulkDialogOpen(true) }}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rejeter tout
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-400 text-gray-600"
                  onClick={() => { setBulkAction('changeRole'); setBulkDialogOpen(true) }}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Changer rôle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => { setBulkAction('delete'); setBulkDialogOpen(true) }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Members Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
            {members.slice(0, 50).map(member => (
              <div
                key={member.id}
                onClick={() => toggleMemberSelection(member.id)}
                className={`p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  selectedMembers.includes(member.id)
                    ? 'bg-[#008751] text-white'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium truncate">{member.firstName} {member.lastName[0]}.</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge className={`text-[10px] px-1 ${
                    member.status === 'approved' ? 'bg-green-600' :
                    member.status === 'pending' ? 'bg-yellow-500 text-black' :
                    'bg-red-600'
                  }`}>
                    {member.status === 'approved' ? '✓' : member.status === 'pending' ? '⏳' : '✗'}
                  </Badge>
                  {member.role === 'admin' && (
                    <Badge className="text-[10px] px-1 bg-purple-600">Admin</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'action</DialogTitle>
            <DialogDescription>
              {bulkAction === 'approve' && `Approuver ${selectedMembers.length} membre(s) ?`}
              {bulkAction === 'reject' && `Rejeter ${selectedMembers.length} membre(s) ?`}
              {bulkAction === 'delete' && `Supprimer ${selectedMembers.length} membre(s) ? Cette action est irréversible.`}
              {bulkAction === 'changeRole' && `Changer le rôle de ${selectedMembers.length} membre(s) ?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={bulkLoading}
              className={bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#008751] hover:bg-[#006b40]'}
            >
              {bulkLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Activity Logs Section
export function ActivityLogsSection() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/activity-logs?limit=100')
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const formatAction = (action: string): string => {
    const actions: Record<string, string> = {
      'create': 'Création',
      'update': 'Modification',
      'delete': 'Suppression',
      'approve': 'Approbation',
      'reject': 'Rejet',
      'bulk_approve': 'Approbation groupée',
      'bulk_reject': 'Rejet groupé',
      'bulk_delete': 'Suppression groupée',
      'bulk_change_role': 'Changement de rôle',
      'login': 'Connexion',
      'logout': 'Déconnexion',
      'payment': 'Paiement',
    }
    return actions[action] || action
  }

  const formatEntityType = (type: string): string => {
    const types: Record<string, string> = {
      'member': 'Membre',
      'article': 'Article',
      'event': 'Événement',
      'donation': 'Don',
      'contribution': 'Cotisation',
    }
    return types[type] || type
  }

  const getActionColor = (action: string): string => {
    if (action.includes('delete')) return 'text-red-600'
    if (action.includes('reject')) return 'text-orange-600'
    if (action.includes('approve')) return 'text-green-600'
    if (action.includes('create')) return 'text-blue-600'
    return 'text-gray-600'
  }

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.entityType === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#008751]" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#008751] flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Historique des Actions
        </CardTitle>
        <CardDescription>
          Consultez les actions récentes des administrateurs
        </CardDescription>
        <div className="mt-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="member">Membres</SelectItem>
              <SelectItem value="donation">Dons</SelectItem>
              <SelectItem value="contribution">Cotisations</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Aucune activité</p>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="w-2 h-2 rounded-full bg-[#008751] mt-2" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className={getActionColor(log.action)}>{formatAction(log.action)}</span>
                    {' - '}
                    <span className="font-medium">{formatEntityType(log.entityType)}</span>
                  </p>
                  {log.member && (
                    <p className="text-xs text-gray-500">
                      Par {log.member.firstName} {log.member.lastName} ({log.member.email})
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Financial Reports Section
export function FinancialReportsSection() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('month')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/financial-stats?period=${period}`)
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [period])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export/financial?type=all')
      const data = await res.json()
      
      // Generate CSV
      const csvContent = [
        Object.keys(data.transactions[0] || {}).join(','),
        ...data.transactions.map((t: Record<string, unknown>) => Object.values(t).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#008751]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Filter & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-[#008751] hover:bg-[#006b40]"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exporter Rapport
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Dons</p>
                <p className="text-xl font-bold text-[#008751]">
                  {formatAmount(stats?.summary.totalDonationAmount || 0)}
                </p>
                <p className="text-xs text-gray-400">
                  {stats?.summary.completedDonations || 0} transactions
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#008751]/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cotisations</p>
                <p className="text-xl font-bold text-[#008751]">
                  {formatAmount(stats?.summary.totalContributionAmount || 0)}
                </p>
                <p className="text-xs text-gray-400">
                  {stats?.summary.completedContributions || 0} transactions
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#008751]/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Global</p>
                <p className="text-xl font-bold text-[#008751]">
                  {formatAmount(stats?.summary.totalAmount || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#008751]/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Moyenne Don</p>
                <p className="text-xl font-bold text-[#008751]">
                  {formatAmount(Math.round(stats?.summary.averageDonation || 0))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#008751]/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {stats?.chartData && stats.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#008751]">Évolution des Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="donations" stroke="#008751" name="Dons" />
                  <Line type="monotone" dataKey="contributions" stroke="#FFD100" name="Cotisations" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#008751]">Par Méthode de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span>Wave</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatAmount((stats?.byPaymentMethod.wave.donations || 0) + (stats?.byPaymentMethod.wave.contributions || 0))}</p>
                  <p className="text-xs text-gray-500">{stats?.byPaymentMethod.wave.count || 0} transactions</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500" />
                  <span>Orange Money</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatAmount((stats?.byPaymentMethod.orange_money.donations || 0) + (stats?.byPaymentMethod.orange_money.contributions || 0))}</p>
                  <p className="text-xs text-gray-500">{stats?.byPaymentMethod.orange_money.count || 0} transactions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#008751]">Top Donateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topDonors?.slice(0, 5).map((donor, i) => (
                <div key={donor.email} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <span className="text-sm font-medium">{i + 1}. {donor.name}</span>
                    <p className="text-xs text-gray-500">{donor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#008751]">{formatAmount(donor.total)}</p>
                    <p className="text-xs text-gray-500">{donor.count} don(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}