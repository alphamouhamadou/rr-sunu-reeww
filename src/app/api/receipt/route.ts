import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get receipt data for a donation or contribution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // donation or contribution
    const id = searchParams.get('id')

    if (!type || !id || !['donation', 'contribution'].includes(type)) {
      return NextResponse.json({ error: 'Type et ID requis' }, { status: 400 })
    }

    if (type === 'donation') {
      const donation = await db.donation.findUnique({
        where: { id },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              membershipNumber: true,
            }
          }
        }
      })

      if (!donation) {
        return NextResponse.json({ error: 'Don non trouvé' }, { status: 404 })
      }

      return NextResponse.json({
        type: 'donation',
        receipt: {
          receiptNumber: `DON-${donation.id.slice(-8).toUpperCase()}`,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          donorPhone: donation.donorPhone,
          memberName: donation.member ? `${donation.member.firstName} ${donation.member.lastName}` : null,
          membershipNumber: donation.member?.membershipNumber || null,
          amount: donation.amount,
          paymentMethod: donation.paymentMethod,
          paymentRef: donation.paymentRef,
          status: donation.status,
          message: donation.message,
          date: donation.createdAt,
        }
      })
    } else {
      const contribution = await db.contribution.findUnique({
        where: { id },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              membershipNumber: true,
            }
          }
        }
      })

      if (!contribution) {
        return NextResponse.json({ error: 'Cotisation non trouvée' }, { status: 404 })
      }

      return NextResponse.json({
        type: 'contribution',
        receipt: {
          receiptNumber: `COT-${contribution.id.slice(-8).toUpperCase()}`,
          memberName: contribution.member ? `${contribution.member.firstName} ${contribution.member.lastName}` : 'N/A',
          memberEmail: contribution.member?.email || 'N/A',
          membershipNumber: contribution.member?.membershipNumber || null,
          amount: contribution.amount,
          month: contribution.month,
          paymentMethod: contribution.paymentMethod,
          paymentRef: contribution.paymentRef,
          status: contribution.status,
          date: contribution.createdAt,
        }
      })
    }
  } catch (error) {
    console.error('Get receipt error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du reçu' }, { status: 500 })
  }
}
