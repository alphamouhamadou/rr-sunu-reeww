// Email Service for RR Sunu Reew
// Utilise Nodemailer pour l'envoi d'emails SMTP

import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface ReminderData {
  memberName: string
  membershipNumber: string
  email: string
  phone: string
  contributionAmount: number
  monthsOverdue: string[]
  customMessage?: string
}

// Create transporter based on environment
function createTransporter() {
  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpPort = process.env.SMTP_PORT || '587'

  if (smtpHost && smtpUser && smtpPass) {
    // Production SMTP configuration
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  }

  // Development: Use ethereal.email for testing
  // This will create a test account automatically
  return null
}

// Send email function
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()

    if (!transporter) {
      // Development mode - log only
      console.log('📧 [DEV MODE] Email non envoyé (SMTP non configuré)')
      console.log('📌 À:', to)
      console.log('📋 Sujet:', subject)
      console.log('📄 Contenu:', html.substring(0, 200) + '...')
      console.log('')
      console.log('💡 Pour activer l\'envoi réel, configurez les variables SMTP:')
      console.log('   SMTP_HOST=smtp.example.com')
      console.log('   SMTP_USER=votre_email@example.com')
      console.log('   SMTP_PASS=votre_mot_de_passe')
      console.log('   SMTP_PORT=587')
      return true
    }

    // Get sender info
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@rrsunureew.sn'
    const fromName = process.env.SMTP_FROM_NAME || 'RR Sunu Reew'

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    })

    console.log('✅ Email envoyé avec succès!')
    console.log('   Message ID:', info.messageId)
    console.log('   À:', to)

    // If using Ethereal (test), show preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('   📎 Preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return true
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}

// Test SMTP connection
export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return {
        success: false,
        message: 'SMTP non configuré. Veuillez définir SMTP_HOST, SMTP_USER et SMTP_PASS'
      }
    }

    await transporter.verify()
    return {
      success: true,
      message: 'Connexion SMTP réussie!'
    }
  } catch (error) {
    return {
      success: false,
      message: `Erreur de connexion SMTP: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

export function generateContributionReminderEmail(data: ReminderData): { subject: string; html: string; text: string } {
  const amount = new Intl.NumberFormat('fr-SN').format(data.contributionAmount) + ' FCFA'
  const monthsList = data.monthsOverdue.join(', ')
  
  const subject = 'Rappel: Cotisation(s) en retard - Renaissance Républicaine Sunu Reew'
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel de cotisation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Renaissance Républicaine</h1>
              <p style="margin: 5px 0 0 0; color: #FFD100; font-size: 18px; font-weight: bold;">Sunu Reew</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #008751; font-size: 20px;">Rappel de cotisation</h2>
              
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                Bonjour <strong>${data.memberName}</strong>,
              </p>
              
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                Nous espérons que vous allez bien. Nous vous contactons concernant votre cotisation mensuelle 
                au parti Renaissance Républicaine Sunu Reew.
              </p>
              
              <!-- Info box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #fff8e6; border-left: 4px solid #FFD100; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">⚠️ Cotisation(s) non payée(s)</p>
                    <p style="margin: 0; color: #666;">
                      <strong>Période(s):</strong> ${monthsList}<br>
                      <strong>Montant par mois:</strong> ${amount}
                    </p>
                  </td>
                </tr>
              </table>
              
              ${data.customMessage ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f0f0f0; border-radius: 5px; padding: 15px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #333; font-style: italic;">${data.customMessage}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                En tant que membre fidèle (N° ${data.membershipNumber}), votre contribution est essentielle 
                pour le bon fonctionnement de notre parti et la réalisation de nos actions sur le terrain.
              </p>
              
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                <strong>Comment régulariser votre situation ?</strong><br>
                Connectez-vous à votre espace membre pour effectuer votre paiement en ligne via :
              </p>
              
              <ul style="margin: 0 0 20px 20px; color: #333; line-height: 1.8;">
                <li>Wave</li>
                <li>Orange Money</li>
                <li>Carte bancaire</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://rrsunureew.sn" style="display: inline-block; background-color: #008751; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Accéder à mon espace membre
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Si vous avez des difficultés ou des questions, n'hésitez pas à contacter notre secrétariat 
                au <strong>+221 33 XXX XX XX</strong> ou par email à <strong>contact@rrsunureew.sn</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">
                Renaissance Républicaine Sunu Reew<br>
                Dakar, Sénégal
              </p>
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} RR Sunu Reew. Tous droits réservés.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  const text = `
Rappel de cotisation - Renaissance Républicaine Sunu Reew

Bonjour ${data.memberName},

Nous espérons que vous allez bien. Nous vous contactons concernant votre cotisation mensuelle au parti Renaissance Républicaine Sunu Reew.

⚠️ Cotisation(s) non payée(s):
Période(s): ${monthsList}
Montant par mois: ${amount}

${data.customMessage ? data.customMessage : ''}

En tant que membre fidèle (N° ${data.membershipNumber}), votre contribution est essentielle pour le bon fonctionnement de notre parti.

Pour régulariser votre situation, connectez-vous à votre espace membre: https://rrsunureew.sn

Modes de paiement acceptés: Wave, Orange Money, Carte bancaire

Pour toute question, contactez-nous au +221 33 XXX XX XX ou contact@rrsunureew.sn

---
Renaissance Républicaine Sunu Reew
Dakar, Sénégal
  `
  
  return { subject, html, text }
}

export function generatePaymentConfirmationEmail(data: {
  memberName: string
  email: string
  amount: number
  paymentType: string
  paymentRef: string
  receiptNumber: string
}): { subject: string; html: string; text: string } {
  const amount = new Intl.NumberFormat('fr-SN').format(data.amount) + ' FCFA'
  
  const subject = 'Confirmation de paiement - ' + data.receiptNumber
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Confirmation de paiement</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">✅ Paiement confirmé</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px 0; color: #333;">
                Bonjour <strong>${data.memberName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333;">
                Nous confirmons la réception de votre paiement.
              </p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f0fff4; border: 1px solid #008751; border-radius: 5px; padding: 15px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 10px 0; color: #333;"><strong>Type:</strong> ${data.paymentType}</p>
                    <p style="margin: 0 0 10px 0; color: #333;"><strong>Montant:</strong> ${amount}</p>
                    <p style="margin: 0 0 10px 0; color: #333;"><strong>Référence:</strong> ${data.paymentRef}</p>
                    <p style="margin: 0; color: #333;"><strong>N° Reçu:</strong> ${data.receiptNumber}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 15px 0; color: #333;">
                Votre reçu est disponible dans votre espace membre. Vous pouvez le télécharger à tout moment.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
                Merci pour votre soutien à Renaissance Républicaine Sunu Reew !
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                Renaissance Républicaine Sunu Reew - Dakar, Sénégal
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  const text = `
Confirmation de paiement - Renaissance Républicaine Sunu Reew

Bonjour ${data.memberName},

Nous confirmons la réception de votre paiement.

Type: ${data.paymentType}
Montant: ${amount}
Référence: ${data.paymentRef}
N° Reçu: ${data.receiptNumber}

Votre reçu est disponible dans votre espace membre.

Merci pour votre soutien !

---
Renaissance Républicaine Sunu Reew
  `
  
  return { subject, html, text }
}

// Generate email verification email
export function generateVerificationEmail(data: {
  memberName: string
  email: string
  verificationUrl: string
}): { subject: string; html: string; text: string } {
  
  const subject = 'Vérifiez votre adresse email - Renaissance Républicaine Sunu Reew'
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification d'email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Renaissance Républicaine</h1>
              <p style="margin: 5px 0 0 0; color: #FFD100; font-size: 18px; font-weight: bold;">Sunu Reew</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #008751; font-size: 20px;">Bienvenue, ${data.memberName} !</h2>
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                Merci de vous être inscrit sur la plateforme de Renaissance Républicaine Sunu Reew.
              </p>
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                Pour finaliser votre inscription et activer votre compte, veuillez cliquer sur le bouton ci-dessous :
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.verificationUrl}" style="display: inline-block; background-color: #008751; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Vérifier mon adresse email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} RR Sunu Reew. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  const text = `Vérification d'email - Renaissance Républicaine Sunu Reew

Bonjour ${data.memberName},

Merci de vous être inscrit. Pour activer votre compte, cliquez sur ce lien :
${data.verificationUrl}

Ce lien expire dans 24 heures.
  `
  return { subject, html, text }
}

// Generate password reset email
export function generatePasswordResetEmail(data: {
  memberName: string
  email: string
  resetUrl: string
}): { subject: string; html: string; text: string } {
  const subject = 'Réinitialisation de votre mot de passe - Renaissance Républicaine Sunu Reew'
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Réinitialisation</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;padding:20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#008751 0%,#006b40 100%);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">Réinitialisation</h1>
        </td></tr>
        <tr><td style="padding:30px;">
          <p style="margin:0 0 15px 0;color:#333;">Bonjour <strong>${data.memberName}</strong>,</p>
          <p style="margin:0 0 20px 0;color:#333;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td align="center" style="padding:20px 0;">
              <a href="${data.resetUrl}" style="display:inline-block;background-color:#008751;color:#ffffff;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">
                Réinitialiser mon mot de passe
              </a>
            </td></tr>
          </table>
          <p style="margin:20px 0 0 0;color:#666;font-size:14px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `
  const text = `Réinitialisation du mot de passe

Bonjour ${data.memberName},

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${data.resetUrl}

Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
  `
  return { subject, html, text }
}

// Generate welcome email after approval
export function generateWelcomeEmail(data: {
  memberName: string
  email: string
  membershipNumber: string
  loginUrl: string
}): { subject: string; html: string; text: string } {
  const subject = 'Bienvenue ! Votre adhésion est validée - Renaissance Républicaine Sunu Reew'
  const html = `
<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Bienvenue</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;padding:20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#008751 0%,#006b40 100%);padding:30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;">🎉 Bienvenue !</h1>
        </td></tr>
        <tr><td style="padding:30px;">
          <p style="margin:0 0 15px 0;color:#333;">Bonjour <strong>${data.memberName}</strong>,</p>
          <p style="margin:0 0 20px 0;color:#333;">Votre adhésion a été <strong style="color:#008751;">validée</strong> !</p>
          <p style="margin:0 0 10px 0;color:#333;"><strong>Votre numéro d'adhérent :</strong></p>
          <p style="margin:0;font-size:24px;color:#008751;font-weight:bold;">${data.membershipNumber}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td align="center" style="padding:20px 0;">
              <a href="${data.loginUrl}" style="display:inline-block;background-color:#008751;color:#ffffff;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">
                Accéder à mon espace
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `
  const text = `Bienvenue !

Bonjour ${data.memberName},

Votre adhésion a été validée !
Votre numéro d'adhérent : ${data.membershipNumber}

Accédez à votre espace : ${data.loginUrl}
  `
  return { subject, html, text }
}

// Generate rejection email
export function generateRejectionEmail(data: {
  memberName: string
  email: string
}): { subject: string; html: string; text: string } {
  const subject = 'Mise à jour de votre demande d\'adhésion - Renaissance Républicaine Sunu Reew'
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mise à jour de votre demande</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Renaissance Républicaine</h1>
              <p style="margin: 5px 0 0 0; color: #FFD100; font-size: 18px; font-weight: bold;">Sunu Reew</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #CE1126; font-size: 20px;">Demande d'adhésion</h2>
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                Bonjour <strong>${data.memberName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                Nous avons examiné votre demande d'adhésion à Renaissance Républicaine Sunu Reew. 
                Après étude de votre dossier, nous regrettons de vous informer que votre demande n'a pas pu être acceptée.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #fff0f0; border-left: 4px solid #CE1126; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, 
                      n'hésitez pas à nous contacter à l'adresse <a href="mailto:contact@rrsunureew.sn" style="color: #008751;">contact@rrsunureew.sn</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Nous vous remercions de l'intérêt que vous portez à notre parti.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} RR Sunu Reew. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  const text = `
Mise à jour de votre demande d'adhésion

Bonjour ${data.memberName},

Nous avons examiné votre demande d'adhésion à Renaissance Républicaine Sunu Reew. 
Après étude de votre dossier, nous regrettons de vous informer que votre demande n'a pas pu être acceptée.

Pour plus d'informations, contactez-nous à contact@rrsunureew.sn

---
Renaissance Républicaine Sunu Reew
  `
  
  return { subject, html, text }
}

// Generate registration confirmation email (pending approval)
export function generateRegistrationConfirmationEmail(data: {
  memberName: string
  email: string
}): { subject: string; html: string; text: string } {
  const subject = 'Inscription reçue - Renaissance Républicaine Sunu Reew'
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscription reçue</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Renaissance Républicaine</h1>
              <p style="margin: 5px 0 0 0; color: #FFD100; font-size: 18px; font-weight: bold;">Sunu Reew</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #008751; font-size: 20px;">✅ Inscription enregistrée</h2>
              <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
                Bonjour <strong>${data.memberName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                Nous avons bien reçu votre demande d'adhésion à Renaissance Républicaine Sunu Reew. 
                Votre demande est actuellement en cours d'examen par notre équipe.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #f0fff4; border: 1px solid #008751; border-radius: 5px; padding: 15px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0 0 10px 0; color: #008751; font-weight: bold;">📋 Prochaines étapes :</p>
                    <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.8;">
                      <li>Votre demande sera examinée par notre équipe</li>
                      <li>Vous recevrez un email de confirmation une fois approuvé</li>
                      <li>Vous pourrez alors accéder à votre espace membre</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Ce processus prend généralement 24 à 48 heures. Merci de votre patience et de votre intérêt pour notre parti.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} RR Sunu Reew. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  const text = `
Inscription reçue - Renaissance Républicaine Sunu Reew

Bonjour ${data.memberName},

Nous avons bien reçu votre demande d'adhésion. Votre demande est en cours d'examen.

Vous recevrez un email de confirmation une fois approuvé.

---
Renaissance Républicaine Sunu Reew
  `
  
  return { subject, html, text }
}

// Generate newsletter email
export function generateNewsletterEmail(data: {
  recipientName: string
  subject: string
  content: string
  unsubscribeUrl: string
}): { subject: string; html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #008751 0%, #006b40 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Renaissance Républicaine</h1>
              <p style="margin: 5px 0 0 0; color: #FFD100; font-size: 18px; font-weight: bold;">Sunu Reew</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px 0; color: #333;">Bonjour ${data.recipientName},</p>
              <div style="color: #333; line-height: 1.6;">
                ${data.content}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #999; font-size: 11px;">
                <a href="${data.unsubscribeUrl}" style="color: #999;">Se désabonner</a> | 
                Renaissance Républicaine Sunu Reew - Dakar, Sénégal
              </p>
              <p style="margin: 0; color: #999; font-size: 11px;">
                © ${new Date().getFullYear()} RR Sunu Reew. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  const text = `
${data.subject}

Bonjour ${data.recipientName},

${data.content.replace(/<[^>]*>/g, '')}

---
Renaissance Républicaine Sunu Reew

Se désabonner: ${data.unsubscribeUrl}
  `
  
  return { subject: data.subject, html, text }
}
