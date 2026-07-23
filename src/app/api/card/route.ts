import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, generateWelcomeEmail } from '@/lib/email-service'
import { logActivity } from '@/lib/activity-logger'

// Check card payment status & get member info for card generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const email = searchParams.get('email')

    if (!memberId && !email) {
      return NextResponse.json({ error: 'memberId ou email requis' }, { status: 400 })
    }

    const member = await db.member.findFirst({
      where: memberId
        ? { id: memberId }
        : { email: email! },
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

// Mark card as paid (used for test mode & PayTech webhook fallback)
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
        status: 'approved',
      }
    })

    // Send welcome/confirmation email after card payment
    const fullMember = await db.member.findUnique({
      where: { id: memberId },
      select: { firstName: true, lastName: true, email: true, membershipNumber: true }
    })

    if (fullMember?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rrsunureew.sn'
      const emailData = generateWelcomeEmail({
        memberName: `${fullMember.firstName} ${fullMember.lastName}`,
        email: fullMember.email,
        membershipNumber: fullMember.membershipNumber || '',
        loginUrl: appUrl
      })
      sendEmail({
        to: fullMember.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      }).then(() => {
        console.log('✅ Email de confirmation envoyé à:', fullMember.email)
      }).catch(err => {
        console.error('⚠️ Erreur envoi email confirmation:', err)
      })
    }

    // Log activity
    logActivity({
      action: 'card_paid',
      entityType: 'member',
      entityId: memberId,
      details: JSON.stringify({ paymentRef, source: 'direct_api' }),
    }).catch(() => {})

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
