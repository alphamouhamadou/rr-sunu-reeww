import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, generateWelcomeEmail } from '@/lib/email-service'
import { logActivity } from '@/lib/activity-logger'

// PayTech webhook for IPN (Instant Payment Notification)
export async function POST(request: NextRequest) {
  try {
    // PayTech may send as form-urlencoded or JSON — handle both
    let body: Record<string, unknown>
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      const params = new URLSearchParams(text)
      body = Object.fromEntries(params.entries())
    } else {
      body = await request.json()
    }
    
    console.log('📦 PayTech webhook reçu:', JSON.stringify(body, null, 2))

    // --- Determine payment type & memberId from multiple possible formats ---
    let paymentType = ''
    let memberId = ''
    let memberEmail = ''
    let itemPrice = ''
    let refCommand = ''
    let itemName = ''
    let clientPhone = ''
    let clientEmail = ''

    // FORMAT A: Standard PayTech IPN (type_event + custom_field)
    const typeEvent = body.type_event as string | undefined
    if (typeEvent === 'sale_complete' || typeEvent === 'payment_success') {
      refCommand = (body.ref_command as string) || ''
      itemPrice = (body.item_price as string) || ''
      itemName = (body.item_name as string) || ''
      clientPhone = (body.client_phone as string) || ''
      clientEmail = (body.client_email as string) || ''
      
      let customData: Record<string, unknown> = {}
      try {
        customData = body.custom_field ? JSON.parse(String(body.custom_field)) : {}
      } catch (e) {
        console.log('⚠️ Impossible de parser custom_field')
      }
      paymentType = (customData.type as string) || ''
      memberId = (customData.memberId as string) || ''
      memberEmail = (customData.memberEmail as string) || ''
    } else {
      // FORMAT B: Alternative / direct format (type + memberId at top level)
      paymentType = (body.type as string) || ''
      memberId = (body.memberId as string) || ''
      memberEmail = (body.customerEmail as string) || (body.memberEmail as string) || ''
      itemPrice = String(body.amount || body.item_price || '')
      refCommand = (body.ref_command || body.refCommand || '') as string
      itemName = (body.itemName || body.item_name || '') as string
      clientPhone = (body.customerPhone || body.client_phone || '') as string
      clientEmail = (body.customerEmail || body.client_email || '') as string
    }

    console.log('📋 Type:', paymentType, '| Montant:', itemPrice, 'FCFA | Membre:', memberId || 'N/A', '| Ref:', refCommand)

    // --- Process based on payment type ---
    if (paymentType === 'donation') {
      try {
        const donation = await db.donation.create({
          data: {
            memberId: memberId || null,
            amount: parseFloat(itemPrice) || 0,
            donorName: itemName || 'Donateur',
            donorEmail: clientEmail || memberEmail || '',
            donorPhone: clientPhone || '',
            paymentMethod: 'paytech',
            paymentRef: refCommand,
            status: 'completed',
          }
        })
        console.log('✅ Don enregistré:', donation.id)
      } catch (e) {
        console.log('⚠️ Erreur don (existe peut-être):', e)
      }
      
    } else if (paymentType === 'contribution' && memberId) {
      const month = new Date().toISOString().slice(0, 7)
      
      try {
        const contribution = await db.contribution.create({
          data: {
            memberId,
            amount: parseFloat(itemPrice) || 0,
            month,
            paymentMethod: 'paytech',
            paymentRef: refCommand,
            status: 'completed',
          }
        })
        console.log('✅ Cotisation enregistrée:', contribution.id)
      } catch (e) {
        console.log('⚠️ Erreur cotisation:', e)
      }
      
    } else if (paymentType === 'card_fee' && memberId) {
      console.log('💳 Frais de carte payé pour:', memberId)
      try {
        // Get current member
        const currentMember = await db.member.findUnique({
          where: { id: memberId },
          select: { 
            membershipNumber: true, status: true, 
            firstName: true, lastName: true, email: true 
          }
        })

        if (!currentMember) {
          console.log('⚠️ Membre non trouvé:', memberId)
          return NextResponse.json({ received: true, error: 'Member not found' })
        }

        const updateData: Record<string, unknown> = {
          hasPaidCard: true,
          cardPaidAt: new Date(),
          status: 'approved',
        }

        // Generate membership number if not already assigned
        if (!currentMember.membershipNumber) {
          const lastMember = await db.member.findFirst({
            where: { membershipNumber: { not: null, startsWith: 'SN-RR-' } },
            select: { membershipNumber: true },
            orderBy: { membershipNumber: 'desc' },
          })
          let nextNum = 1
          if (lastMember?.membershipNumber) {
            const parts = lastMember.membershipNumber.split('-')
            const parsed = parseInt(parts[parts.length - 1], 10)
            if (!isNaN(parsed)) nextNum = parsed + 1
          }
          updateData.membershipNumber = `SN-RR-${String(nextNum).padStart(6, '0')}`
          updateData.membershipDate = new Date()
          console.log('📋 Numéro de membre généré:', updateData.membershipNumber)
        }

        await db.member.update({
          where: { id: memberId },
          data: updateData,
        })
        console.log('✅ Carte membre activée pour:', memberId)

        // --- Send welcome/confirmation email AFTER successful card payment ---
        const finalMember = await db.member.findUnique({
          where: { id: memberId },
          select: { membershipNumber: true, firstName: true, lastName: true, email: true }
        })

        if (finalMember && finalMember.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rrsunureew.sn'
          const emailData = generateWelcomeEmail({
            memberName: `${finalMember.firstName} ${finalMember.lastName}`,
            email: finalMember.email,
            membershipNumber: finalMember.membershipNumber || '',
            loginUrl: appUrl
          })

          sendEmail({
            to: finalMember.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text
          }).then(() => {
            console.log('✅ Email de confirmation envoyé à:', finalMember.email)
          }).catch(err => {
            console.error('⚠️ Erreur envoi email confirmation:', err)
          })
        }

        // Log activity
        logActivity({
          action: 'card_paid',
          entityType: 'member',
          entityId: memberId,
          details: JSON.stringify({ 
            paymentRef: refCommand, 
            membershipNumber: updateData.membershipNumber 
          }),
        }).catch(() => {})

      } catch (e) {
        console.log('⚠️ Erreur activation carte:', e)
      }
    }

    return NextResponse.json({ 
      received: true,
      success: true,
      ref_command: refCommand,
    })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ 
      received: false, 
      error: 'Webhook failed' 
    }, { status: 500 })
  }
}

// GET pour tester si le webhook est accessible
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'PayTech Webhook endpoint',
    endpoint: '/api/paytech/webhook'
  })
}
