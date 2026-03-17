import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Email verification endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/?verification=error&message=Token manquant', request.url))
    }

    // Find member with this token
    const member = await db.member.findFirst({
      where: {
        verificationToken: token,
      }
    })

    if (!member) {
      return NextResponse.redirect(new URL('/?verification=error&message=Token invalide', request.url))
    }

    // Check if token is expired
    if (member.verificationTokenExpiry && member.verificationTokenExpiry < new Date()) {
      return NextResponse.redirect(new URL('/?verification=error&message=Token expiré', request.url))
    }

    // Update member: mark email as verified and clear token
    await db.member.update({
      where: { id: member.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      }
    })

    // Redirect to success page
    return NextResponse.redirect(new URL('/?verification=success', request.url))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/?verification=error&message=Erreur serveur', request.url))
  }
}
