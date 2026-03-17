import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PayTech webhook for IPN (Instant Payment Notification)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📦 PayTech webhook reçu:', JSON.stringify(body, null, 2))

    const { 
      type_event,
      ref_command,
      item_name,
      item_price,
      custom_field,
      client_phone,
      client_email,
    } = body

    // Vérifier le type d'événement
    if (type_event !== 'sale_complete' && type_event !== 'payment_success') {
      console.log('⚠️ Événement non géré:', type_event)
      return NextResponse.json({ received: true, message: 'Event not handled' })
    }

    // Parser le champ custom
    let customData = {}
    try {
      customData = custom_field ? JSON.parse(custom_field) : {}
    } catch (e) {
      console.log('⚠️ Impossible de parser custom_field')
    }
    
    const { type: paymentType, memberId, memberEmail } = customData as {
      type?: string
      memberId?: string
      memberEmail?: string
    }

    console.log('📋 Type:', paymentType, '| Montant:', item_price, 'FCFA | Ref:', ref_command)

    // Traiter selon le type de paiement
    if (paymentType === 'donation') {
      try {
        const donation = await db.donation.create({
          data: {
            memberId: memberId || null,
            amount: parseFloat(item_price) || 0,
            donorName: item_name || 'Donateur',
            donorEmail: client_email || memberEmail || '',
            donorPhone: client_phone || '',
            paymentMethod: 'paytech',
            paymentRef: ref_command,
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
            amount: parseFloat(item_price) || 0,
            month,
            paymentMethod: 'paytech',
            paymentRef: ref_command,
            status: 'completed',
          }
        })
        console.log('✅ Cotisation enregistrée:', contribution.id)
      } catch (e) {
        console.log('⚠️ Erreur cotisation:', e)
      }
      
    } else if (paymentType === 'card_fee' && memberId) {
      console.log('✅ Frais de carte payé pour:', memberId)
    }

    return NextResponse.json({ 
      received: true,
      success: true,
      ref_command,
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