import { NextResponse } from 'next/server'
import { testSmtpConnection, sendEmail } from '@/lib/email-service'

// Test SMTP connection
export async function GET() {
  const result = await testSmtpConnection()
  return NextResponse.json(result)
}

// Send test email
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const success = await sendEmail({
      to: email,
      subject: 'Test SMTP - Renaissance Républicaine Sunu Reew',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #008751;">✅ Test SMTP réussi !</h1>
          <p>Si vous recevez cet email, votre configuration SMTP fonctionne correctement.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Renaissance Républicaine Sunu Reew<br>
            Configuration SMTP Gmail active
          </p>
        </div>
      `,
      text: 'Test SMTP réussi ! Votre configuration SMTP fonctionne correctement.'
    })

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email envoyé avec succès ! Vérifiez votre boîte de réception.' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Erreur lors de l\'envoi de l\'email. Vérifiez les logs serveur.' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 })
  }
}
