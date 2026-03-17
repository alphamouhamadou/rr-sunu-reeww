import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

// Change member password (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, newPassword } = body

    if (!memberId || !newPassword) {
      return NextResponse.json({ error: 'ID membre et nouveau mot de passe requis' }, { status: 400 })
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // Check if member exists
    const member = await db.member.findUnique({
      where: { id: memberId },
      select: { id: true, email: true, firstName: true, lastName: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db.member.update({
      where: { id: memberId },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'password_change',
        entityType: 'member',
        entityId: memberId,
        details: JSON.stringify({ 
          memberEmail: member.email,
          memberName: `${member.firstName} ${member.lastName}`
        })
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Mot de passe modifié pour ${member.firstName} ${member.lastName}` 
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Erreur lors du changement de mot de passe' }, { status: 500 })
  }
}
