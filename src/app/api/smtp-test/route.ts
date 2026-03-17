import { NextRequest, NextResponse } from 'next/server'

// Test SMTP connection - returns status
export async function GET() {
  try {
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpPort = process.env.SMTP_PORT || '587'

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ 
        success: false, 
        configured: false,
        message: 'SMTP non configuré. Veuillez définir SMTP_HOST, SMTP_USER et SMTP_PASS dans le fichier .env' 
      })
    }

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.verify()
    
    return NextResponse.json({ 
      success: true, 
      configured: true,
      message: 'Connexion SMTP réussie ! Le service email est opérationnel.',
      config: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        from: process.env.SMTP_FROM || smtpUser
      }
    })
  } catch (error) {
    console.error('SMTP test error:', error)
    return NextResponse.json({ 
      success: false, 
      configured: true,
      message: `Erreur de connexion SMTP: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 })
  }
}

// Send test email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json({ 
        success: false, 
        message: 'Adresse email requise' 
      }, { status: 400 })
    }

    // Check SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ 
        success: false, 
        message: 'SMTP non configuré. Veuillez définir les variables SMTP dans .env' 
      }, { status: 400 })
    }

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer')
    
    const smtpPort = process.env.SMTP_PORT || '587'
    const fromEmail = process.env.SMTP_FROM || smtpUser
    const fromName = process.env.SMTP_FROM_NAME || 'RR Sunu Reew'

    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Send test email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: '✅ Test SMTP - Renaissance Républicaine Sunu Reew',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Test SMTP Réussi</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 15px 0;">Félicitations !</p>
            <p style="margin: 0 0 15px 0;">Votre configuration SMTP fonctionne correctement. Les emails seront envoyés depuis cette adresse.</p>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Envoyé le ${new Date().toLocaleString('fr-FR')}<br>
              Depuis: ${fromEmail}
            </p>
          </div>
        </div>
      `,
      text: `Test SMTP Réussi!\n\nVotre configuration SMTP fonctionne correctement.\n\nEnvoyé le ${new Date().toLocaleString('fr-FR')}\nDepuis: ${fromEmail}`
    })

    console.log('✅ Test email sent:', info.messageId)

    return NextResponse.json({ 
      success: true, 
      message: `Email de test envoyé avec succès à ${to}`,
      messageId: info.messageId
    })
  } catch (error) {
    console.error('SMTP send error:', error)
    return NextResponse.json({ 
      success: false, 
      message: `Erreur lors de l'envoi: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 })
  }
}
