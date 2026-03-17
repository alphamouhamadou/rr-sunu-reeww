import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateReceiptPDF, generateReceiptNumber, getReceiptFilename } from '@/lib/receipts/generate-receipt'

// Generate receipt for a donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { donationId, contributionId } = body

    if (donationId) {
      const donation = await db.donation.findUnique({
        where: { id: donationId },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              membershipNumber: true
            }
          }
        }
      })

      if (!donation) {
        return NextResponse.json({ error: 'Don non trouvé' }, { status: 404 })
      }

      const receiptNumber = generateReceiptNumber('donation', donationId)
      const pdfBuffer = generateReceiptPDF({
        receiptNumber,
        date: donation.createdAt,
        memberName: donation.member 
          ? `${donation.member.firstName} ${donation.member.lastName}`
          : donation.donorName,
        membershipNumber: donation.member?.membershipNumber || 'N/A',
        amount: donation.amount,
        paymentMethod: donation.paymentMethod,
        paymentRef: donation.paymentRef || receiptNumber,
        type: 'donation'
      })

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${getReceiptFilename({
            receiptNumber,
            date: donation.createdAt,
            memberName: donation.member 
              ? `${donation.member.firstName} ${donation.member.lastName}`
              : donation.donorName,
            membershipNumber: donation.member?.membershipNumber || 'N/A',
            amount: donation.amount,
            paymentMethod: donation.paymentMethod,
            paymentRef: donation.paymentRef || receiptNumber,
            type: 'donation'
          })}"`
        }
      })
    }

    if (contributionId) {
      const contribution = await db.contribution.findUnique({
        where: { id: contributionId },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              membershipNumber: true
            }
          }
        }
      })

      if (!contribution) {
        return NextResponse.json({ error: 'Cotisation non trouvée' }, { status: 404 })
      }

      const receiptNumber = generateReceiptNumber('contribution', contributionId)
      
      // Formater le mois
      const [year, month] = contribution.month.split('-')
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      const period = `${monthNames[parseInt(month) - 1]} ${year}`

      const pdfBuffer = generateReceiptPDF({
        receiptNumber,
        date: contribution.createdAt,
        memberName: `${contribution.member.firstName} ${contribution.member.lastName}`,
        membershipNumber: contribution.member.membershipNumber || 'N/A',
        amount: contribution.amount,
        paymentMethod: contribution.paymentMethod,
        paymentRef: contribution.paymentRef || receiptNumber,
        type: 'contribution',
        period
      })

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${getReceiptFilename({
            receiptNumber,
            date: contribution.createdAt,
            memberName: `${contribution.member.firstName} ${contribution.member.lastName}`,
            membershipNumber: contribution.member.membershipNumber || 'N/A',
            amount: contribution.amount,
            paymentMethod: contribution.paymentMethod,
            paymentRef: contribution.paymentRef || receiptNumber,
            type: 'contribution',
            period
          })}"`
        }
      })
    }

    return NextResponse.json({ error: 'ID de don ou cotisation requis' }, { status: 400 })
  } catch (error) {
    console.error('Generate receipt error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du reçu' }, { status: 500 })
  }
}
