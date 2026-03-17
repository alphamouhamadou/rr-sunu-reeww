import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get financial data for export
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // donations, contributions, all
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const dateFilter: Record<string, unknown> = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.lte = new Date(endDate)
    }

    const statusFilter = status ? { status } : {}

    let donations: unknown[] = []
    let contributions: unknown[] = []
    let stats = {
      totalDonations: 0,
      totalContributions: 0,
      completedDonations: 0,
      completedContributions: 0,
      pendingDonations: 0,
      pendingContributions: 0,
      donationAmount: 0,
      contributionAmount: 0,
    }

    // Get donations
    if (type === 'all' || type === 'donations') {
      const donationData = await db.donation.findMany({
        where: { ...dateFilter, ...statusFilter },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              membershipNumber: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      donations = donationData.map(d => ({
        'Type': 'Don',
        'ID': d.id,
        'Montant (FCFA)': d.amount,
        'Donateur': d.donorName,
        'Email': d.donorEmail,
        'Téléphone': d.donorPhone,
        'Méthode paiement': d.paymentMethod === 'wave' ? 'Wave' : d.paymentMethod === 'orange_money' ? 'Orange Money' : d.paymentMethod,
        'Référence': d.paymentRef || 'N/A',
        'Statut': d.status === 'completed' ? 'Complété' : d.status === 'pending' ? 'En attente' : 'Échoué',
        'Membre': d.member ? `${d.member.firstName} ${d.member.lastName}` : 'Non membre',
        'N° Membre': d.member?.membershipNumber || 'N/A',
        'Message': d.message || '',
        'Date': new Date(d.createdAt).toLocaleDateString('fr-FR'),
        'Heure': new Date(d.createdAt).toLocaleTimeString('fr-FR'),
      }))

      stats.totalDonations = donationData.length
      stats.completedDonations = donationData.filter(d => d.status === 'completed').length
      stats.pendingDonations = donationData.filter(d => d.status === 'pending').length
      stats.donationAmount = donationData.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0)
    }

    // Get contributions
    if (type === 'all' || type === 'contributions') {
      const contributionData = await db.contribution.findMany({
        where: { ...dateFilter, ...statusFilter },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              membershipNumber: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      contributions = contributionData.map(c => ({
        'Type': 'Cotisation',
        'ID': c.id,
        'Montant (FCFA)': c.amount,
        'Mois': c.month,
        'Membre': c.member ? `${c.member.firstName} ${c.member.lastName}` : 'N/A',
        'Email': c.member?.email || 'N/A',
        'N° Membre': c.member?.membershipNumber || 'N/A',
        'Méthode paiement': c.paymentMethod === 'wave' ? 'Wave' : c.paymentMethod === 'orange_money' ? 'Orange Money' : c.paymentMethod,
        'Référence': c.paymentRef || 'N/A',
        'Statut': c.status === 'completed' ? 'Complété' : c.status === 'pending' ? 'En attente' : 'Échoué',
        'Date': new Date(c.createdAt).toLocaleDateString('fr-FR'),
        'Heure': new Date(c.createdAt).toLocaleTimeString('fr-FR'),
      }))

      stats.totalContributions = contributionData.length
      stats.completedContributions = contributionData.filter(c => c.status === 'completed').length
      stats.pendingContributions = contributionData.filter(c => c.status === 'pending').length
      stats.contributionAmount = contributionData.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0)
    }

    // Combine for export
    const allTransactions = type === 'all' 
      ? [...donations, ...contributions]
      : type === 'donations' 
        ? donations 
        : contributions

    return NextResponse.json({ 
      transactions: allTransactions,
      stats: {
        ...stats,
        totalAmount: stats.donationAmount + stats.contributionAmount
      },
      filename: `rapport-financier-rr-sunu-reew-${new Date().toISOString().split('T')[0]}`,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Export financial error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'export financier' }, { status: 500 })
  }
}
