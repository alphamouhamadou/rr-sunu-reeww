import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Check card payment status & get member info for card generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'memberId requis' }, { status: 400 })
    }

    const member = await db.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        photo: true,
        membershipNumber: true,
        membershipDate: true,
        status: true,
        hasPaidCard: true,
        cardPaidAt: true,
        dateOfBirth: true,
        placeOfBirth: true,
        residenceType: true,
        country: true,
        cityAbroad: true,
        region: { select: { name: true } },
        department: { select: { name: true } },
        commune: { select: { name: true } },
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Card info error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Mark card as paid after PayTech webhook confirms payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, paymentRef } = body

    if (!memberId) {
      return NextResponse.json({ error: 'memberId requis' }, { status: 400 })
    }

    const member = await db.member.update({
      where: { id: memberId },
      data: {
        hasPaidCard: true,
        cardPaidAt: new Date(),
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Carte marquée comme payée',
      member: {
        id: member.id,
        hasPaidCard: member.hasPaidCard,
        cardPaidAt: member.cardPaidAt,
      }
    })
  } catch (error) {
    console.error('Card payment error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}