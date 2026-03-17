import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PAYTECH_URL = 'https://paytech.sn/api/payment/request-payment'

async function getPayTechSettings() {
  const settings = await db.setting.findMany({
    where: {
      key: { in: ['paytech_api_key', 'paytech_secret_key', 'paytech_mode', 'app_url'] }
    }
  })
  
  const settingsObj: Record<string, string> = {}
  settings.forEach(s => { settingsObj[s.key] = s.value })
  
  return {
    apiKey: settingsObj['paytech_api_key'] || '',
    secretKey: settingsObj['paytech_secret_key'] || '',
    mode: settingsObj['paytech_mode'] || 'test',
    appUrl: settingsObj['app_url'] || '',
  }
}

function hasValidKeys(apiKey: string, secretKey: string) {
  return apiKey && apiKey.length > 5 && secretKey && secretKey.length > 5
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, type = 'donation', itemName, customerEmail, customerPhone, memberId } = body

    const { apiKey, secretKey, appUrl } = await getPayTechSettings()
    
    const refCommand = `RR-${type.toUpperCase()}-${Date.now()}`
    
    // IMPORTANT: PayTech exige des URLs HTTPS
    // En local, utiliser une URL de redirection temporaire
    const isLocalDev = !appUrl || appUrl.includes('localhost')
    const baseUrl = isLocalDev 
      ? 'https://rrsunureew.sn'  // URL de prod (ou mettre votre domaine HTTPS)
      : appUrl

    // MODE TEST - Pas de clés configurées
    if (!hasValidKeys(apiKey, secretKey)) {
      console.log('🔧 MODE TEST - Pas de clés PayTech')
      
      const testUrl = `${baseUrl}/payment/success?ref=${refCommand}`
      
      return NextResponse.json({
        success: 1,
        testMode: true,
        redirect_url: testUrl,
        redirectUrl: testUrl,
        successRedirectUrl: testUrl,
        token: `test-${refCommand}`,
        refCommand,
      })
    }

    console.log('💳 Appel PayTech')
    console.log(`   Montant: ${amount} XOF`)
    console.log(`   Réf: ${refCommand}`)

    // URLs HTTPS obligatoires pour PayTech
    const successUrl = `${baseUrl}/payment/success?ref=${refCommand}`
    const cancelUrl = `${baseUrl}/payment/cancel?ref=${refCommand}`
    const ipnUrl = `${baseUrl}/api/paytech/webhook`

    const formData = new URLSearchParams()
    formData.append('item_name', itemName || `RR Sunu Reew - ${type}`)
    formData.append('item_price', String(amount))
    formData.append('currency', 'XOF')
    formData.append('ref_command', refCommand)
    formData.append('command_name', `Paiement ${type} - RR Sunu Reew`)
    formData.append('env', 'test')
    formData.append('success_url', successUrl)
    formData.append('cancel_url', cancelUrl)
    formData.append('ipn_url', ipnUrl)

    console.log('📤 success_url:', successUrl)

    const response = await fetch(PAYTECH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'API_KEY': apiKey,
        'API_SECRET': secretKey,
      },
      body: formData.toString(),
    })

    const responseText = await response.text()
    console.log('📥 Status:', response.status)
    console.log('📥 Réponse:', responseText.substring(0, 300))

    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ success: 0, error: 'Réponse invalide de PayTech' }, { status: 400 })
    }

    // Erreur PayTech
    if (result.success !== 1) {
      if (result.message?.includes('activer') || result.message?.includes('contactez')) {
        const pendingUrl = `${baseUrl}/payment/success?ref=${refCommand}&pending=true`
        return NextResponse.json({
          success: 1,
          pendingMode: true,
          redirect_url: pendingUrl,
          redirectUrl: pendingUrl,
          successRedirectUrl: pendingUrl,
          token: `pending-${refCommand}`,
          refCommand,
        })
      }
      
      return NextResponse.json({ success: 0, error: result.message || 'Erreur PayTech' }, { status: 400 })
    }

    // ✅ SUCCÈS
    const redirectUrl = result.redirect_url || result.redirectUrl || ''
    console.log('✅ SUCCÈS PayTech!')
    console.log(`   URL: ${redirectUrl}`)

    return NextResponse.json({
      success: 1,
      redirect_url: redirectUrl,
      redirectUrl: redirectUrl,
      successRedirectUrl: redirectUrl,
      token: result.token,
      refCommand,
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
    return NextResponse.json({ success: 0, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 400 })
  if (token.startsWith('test-') || token.startsWith('pending-')) {
    return NextResponse.json({ success: 1, status: 'completed', testMode: true })
  }
  
  const { apiKey, secretKey } = await getPayTechSettings()
  if (!hasValidKeys(apiKey, secretKey)) {
    return NextResponse.json({ success: 1, status: 'completed', testMode: true })
  }

  try {
    const res = await fetch(`https://paytech.sn/api/payment/get-status?token_payment=${token}`, {
      headers: { 'Accept': 'application/json', 'API_KEY': apiKey, 'API_SECRET': secretKey },
    })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ success: 1, status: 'pending' })
  }
}