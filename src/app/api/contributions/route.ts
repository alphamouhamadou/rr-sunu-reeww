import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get contributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    // If no memberId, return all contributions (for admin)
    if (!memberId) {
      const contributions = await db.contribution.findMany({
        orderBy: { month: 'desc' },
        take: 100,
      })
      return NextResponse.json({ contributions })
    }

    const contributions = await db.contribution.findMany({
      where: { memberId },
      orderBy: { month: 'desc' },
    })

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('Get contributions error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des cotisations' }, { status: 500 })
  }
}

// Create contribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, month, paymentMethod } = body

    // Check if already paid for this month
    const existing = await db.contribution.findFirst({
      where: { memberId, month }
    })

    if (existing) {
      return NextResponse.json({ error: 'Cotisation déjà payée pour ce mois' }, { status: 400 })
    }

    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { membershipNumber: true }
    })

    const paymentRef = `COT-${member?.membershipNumber}-${month}`

    const contribution = await db.contribution.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        month,
        paymentMethod,
        paymentRef,
        status: 'completed',
      }
    })

    return NextResponse.json({ 
      message: 'Cotisation enregistrée avec succès',
      contribution 
    })
  } catch (error) {
    console.error('Create contribution error:', error)
    return NextResponse.json({ error: 'Erreur lors de la cotisation' }, { status: 500 })
  }
}
