import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/verification-echec?reason=no_token', request.url))
    }

    // Chercher le membre avec ce token
    const member = await db.member.findFirst({
      where: {
        verificationToken: token,
      }
    })

    // Si aucun membre trouvé avec ce token
    if (!member) {
      return NextResponse.redirect(new URL('/verification-echec?reason=invalid', request.url))
    }

    // Vérifier si le token n'a pas expiré
    if (member.verificationTokenExpiry && member.verificationTokenExpiry < new Date()) {
      return NextResponse.redirect(new URL('/verification-echec?reason=expired', request.url))
    }

    // Vérifier si déjà vérifié
    if (member.emailVerified) {
      return NextResponse.redirect(new URL('/verification-succes?already=true', request.url))
    }

    // Mettre à jour le membre comme vérifié
    await db.member.update({
      where: { id: member.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      }
    })

    console.log('✅ Email vérifié pour:', member.email)

    return NextResponse.redirect(new URL('/verification-succes', request.url))
  } catch (error) {
    console.error('❌ Erreur de vérification:', error)
    return NextResponse.redirect(new URL('/verification-echec?reason=error', request.url))
  }
}