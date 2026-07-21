import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get financial statistics by period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, week, month, year, all
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    let rangeStart: Date
    let rangeEnd: Date = now

    if (startDate && endDate) {
      rangeStart = new Date(startDate)
      rangeEnd = new Date(endDate)
    } else {
      switch (period) {
        case 'day':
          rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          rangeStart = new Date(now.getFullYear(), 0, 1)
          break
        default:
          rangeStart = new Date(2020, 0, 1) // All time
      }
    }

    // Get donations in period
    const donations = await db.donation.findMany({
      where: {
        createdAt: {
          gte: rangeStart,
          lte: rangeEnd
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Get contributions in period
    const contributions = await db.contribution.findMany({
      where: {
        createdAt: {
          gte: rangeStart,
          lte: rangeEnd
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate stats
    const completedDonations = donations.filter(d => d.status === 'completed')
    const completedContributions = contributions.filter(c => c.status === 'completed')

    const totalDonationAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0)
    const totalContributionAmount = completedContributions.reduce((sum, c) => sum + c.amount, 0)

    // Group by payment method
    const byPaymentMethod = {
      wave: {
        donations: completedDonations.filter(d => d.paymentMethod === 'wave').reduce((sum, d) => sum + d.amount, 0),
        contributions: completedContributions.filter(c => c.paymentMethod === 'wave').reduce((sum, c) => sum + c.amount, 0),
        count: donations.filter(d => d.paymentMethod === 'wave').length + contributions.filter(c => c.paymentMethod === 'wave').length
      },
      orange_money: {
        donations: completedDonations.filter(d => d.paymentMethod === 'orange_money').reduce((sum, d) => sum + d.amount, 0),
        contributions: completedContributions.filter(c => c.paymentMethod === 'orange_money').reduce((sum, c) => sum + c.amount, 0),
        count: donations.filter(d => d.paymentMethod === 'orange_money').length + contributions.filter(c => c.paymentMethod === 'orange_money').length
      }
    }

    // Group by month for chart data
    const monthlyData: Record<string, { donations: number; contributions: number; month: string }> = {}
    
    completedDonations.forEach(d => {
      const monthKey = new Date(d.createdAt).toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { donations: 0, contributions: 0, month: monthKey }
      }
      monthlyData[monthKey].donations += d.amount
    })

    completedContributions.forEach(c => {
      const monthKey = new Date(c.createdAt).toISOString().slice(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { donations: 0, contributions: 0, month: monthKey }
      }
      monthlyData[monthKey].contributions += c.amount
    })

    // Convert to array and sort
    const chartData = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12) // Last 12 months
      .map(d => ({
        month: d.month,
        donations: d.donations,
        contributions: d.contributions,
        total: d.donations + d.contributions
      }))

    // Top donors
    const donorTotals: Record<string, { name: string; email: string; total: number; count: number }> = {}
    completedDonations.forEach(d => {
      const key = d.donorEmail
      if (!donorTotals[key]) {
        donorTotals[key] = {
          name: d.donorName,
          email: d.donorEmail,
          total: 0,
          count: 0
        }
      }
      donorTotals[key].total += d.amount
      donorTotals[key].count++
    })

    const topDonors = Object.values(donorTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return NextResponse.json({
      period: {
        start: rangeStart,
        end: rangeEnd,
        type: period
      },
      summary: {
        totalDonations: donations.length,
        completedDonations: completedDonations.length,
        totalDonationAmount,
        totalContributions: contributions.length,
        completedContributions: completedContributions.length,
        totalContributionAmount,
        totalAmount: totalDonationAmount + totalContributionAmount,
        averageDonation: completedDonations.length > 0 ? totalDonationAmount / completedDonations.length : 0,
        averageContribution: completedContributions.length > 0 ? totalContributionAmount / completedContributions.length : 0,
      },
      byPaymentMethod,
      chartData,
      topDonors,
      pendingPayments: {
        donations: donations.filter(d => d.status === 'pending').length,
        contributions: contributions.filter(c => c.status === 'pending').length,
      }
    })
  } catch (error) {
    console.error('Financial stats error:', error)
    return NextResponse.json({ error: 'Erreur lors du calcul des statistiques' }, { status: 500 })
  }
}
