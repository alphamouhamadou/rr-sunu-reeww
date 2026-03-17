import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateResetToken } from '@/lib/password'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email-service'

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Find member by email
    const member = await db.member.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Don't reveal if email exists or not
    if (!member) {
      return NextResponse.json({ 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
      })
    }

    // Generate reset token
    const { token, expiry } = generateResetToken()

    // Save token to member
    await db.member.update({
      where: { id: member.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      }
    })

    // Generate reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/?reset-password=${token}`

    // Send email with reset link
    const emailData = generatePasswordResetEmail({
      memberName: `${member.firstName} ${member.lastName}`,
      email: member.email,
      resetUrl
    })

    // Send email (non-blocking)
    sendEmail({
      to: member.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    }).catch(err => console.error('Failed to send reset email:', err))

    console.log(`Password reset for ${member.email}: ${resetUrl}`)

    return NextResponse.json({ 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    })
  } catch (error) {
    console.error('Reset request error:', error)
    return NextResponse.json({ error: 'Erreur lors de la demande de réinitialisation' }, { status: 500 })
  }
}

// Verify reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token requis' }, { status: 400 })
    }

    const member = await db.member.findFirst({
      where: {
        resetToken: token,
      }
    })

    if (!member) {
      return NextResponse.json({ valid: false, error: 'Token invalide' })
    }

    // Check if token is expired
    if (member.resetTokenExpiry && member.resetTokenExpiry < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expiré' })
    }

    return NextResponse.json({ 
      valid: true, 
      email: member.email,
      memberId: member.id 
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// Reset password with token
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token et nouveau mot de passe requis' }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    const member = await db.member.findFirst({
      where: {
        resetToken: token,
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 400 })
    }

    // Check if token is expired
    if (member.resetTokenExpiry && member.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Token expiré' }, { status: 400 })
    }

    // Hash new password
    const { hashPassword } = await import('@/lib/password')
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear reset token
    await db.member.update({
      where: { id: member.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Erreur lors de la réinitialisation' }, { status: 500 })
  }
}
