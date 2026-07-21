import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get donations (admin) or create donation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    const where: Record<string, unknown> = {}
    if (memberId) where.memberId = memberId

    const donations = await db.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ donations })
  } catch (error) {
    console.error('Get donations error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des dons' }, { status: 500 })
  }
}

// Create donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, donorName, donorEmail, donorPhone, paymentMethod, message } = body

    // Simulate payment reference
    const paymentRef = `${paymentMethod.toUpperCase()}-${Date.now()}`

    const donation = await db.donation.create({
      data: {
        memberId: memberId || null,
        amount: parseFloat(amount),
        donorName,
        donorEmail,
        donorPhone,
        paymentMethod,
        paymentRef,
        message,
        status: 'completed', // Mock: auto-complete
      }
    })

    return NextResponse.json({ 
      message: 'Don effectué avec succès',
      donation 
    })
  } catch (error) {
    console.error('Create donation error:', error)
    return NextResponse.json({ error: 'Erreur lors du don' }, { status: 500 })
  }
}
