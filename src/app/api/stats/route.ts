import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get statistics for admin dashboard
export async function GET() {
  try {
    // Member stats
    const totalMembers = await db.member.count({ where: { role: 'member' } })
    const pendingMembers = await db.member.count({ where: { status: 'pending' } })
    const approvedMembers = await db.member.count({ where: { status: 'approved' } })

    // Financial stats
    const donations = await db.donation.findMany({
      where: { status: 'completed' }
    })
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)

    const contributions = await db.contribution.findMany({
      where: { status: 'completed' }
    })
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)

    // Members by region
    const membersByRegion = await db.member.groupBy({
      by: ['regionId'],
      where: { status: 'approved' },
      _count: true,
    })

    const regions = await db.region.findMany()
    const regionStats = membersByRegion.map(stat => {
      const region = regions.find(r => r.id === stat.regionId)
      return {
        region: region?.name || 'Non spécifié',
        count: stat._count
      }
    }).sort((a, b) => b.count - a.count)

    // Recent activity
    const recentMembers = await db.member.findMany({
      where: { status: 'approved' },
      select: { firstName: true, lastName: true, createdAt: true, region: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentDonations = await db.donation.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      members: {
        total: totalMembers,
        pending: pendingMembers,
        approved: approvedMembers,
        byRegion: regionStats,
      },
      donations: {
        total: donations.length,
        amount: totalDonations,
      },
      contributions: {
        total: contributions.length,
        amount: totalContributions,
      },
      recentMembers,
      recentDonations,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des statistiques' }, { status: 500 })
  }
}
