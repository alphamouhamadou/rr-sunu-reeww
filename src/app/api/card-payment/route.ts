import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Record card payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json({ error: 'ID membre requis' }, { status: 400 })
    }

    // Check if member exists
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { id: true, hasPaidCard: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Update card payment status
    const updatedMember = await db.member.update({
      where: { id: memberId },
      data: {
        hasPaidCard: true,
        cardPaidAt: new Date()
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'card_payment',
        entityType: 'member',
        entityId: memberId,
        details: JSON.stringify({ paymentType: 'membership_card', amount: 2000 })
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Paiement de la carte enregistré',
      hasPaidCard: true,
      cardPaidAt: updatedMember.cardPaidAt
    })
  } catch (error) {
    console.error('Card payment error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du paiement' }, { status: 500 })
  }
}

// Check card payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'ID membre requis' }, { status: 400 })
    }

    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { hasPaidCard: true, cardPaidAt: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ 
      hasPaidCard: member.hasPaidCard,
      cardPaidAt: member.cardPaidAt
    })
  } catch (error) {
    console.error('Check card payment error:', error)
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
  }
}
