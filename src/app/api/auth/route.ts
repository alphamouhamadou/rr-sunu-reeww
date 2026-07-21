import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, isBcryptHash, decodeBase64Password, hashPassword } from '@/lib/password'

// Admin login only - public user authentication has been removed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const member = await db.member.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        phone: true,
        photo: true,
        role: true,
        status: true,
        membershipNumber: true,
        membershipDate: true,
        residenceType: true,
        country: true,
        cityAbroad: true,
        hasPaidCard: true,
        cardPaidAt: true,
        region: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        commune: { select: { id: true, name: true } },
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    // Only allow admin login
    if (member.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Check password
    let passwordValid = false
    
    if (isBcryptHash(member.password)) {
      passwordValid = await verifyPassword(password, member.password)
    } else {
      // Legacy base64 encoding - check and migrate
      const legacyPassword = decodeBase64Password(member.password)
      passwordValid = legacyPassword === password
      
      // Migrate to bcrypt on successful login
      if (passwordValid) {
        const hashedPassword = await hashPassword(password)
        await db.member.update({
          where: { id: member.id },
          data: { password: hashedPassword }
        })
        console.log(`Migrated password for admin ${member.id}`)
      }
    }

    if (!passwordValid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    if (member.status !== 'approved') {
      return NextResponse.json({ error: 'Votre compte n\'est pas encore validé' }, { status: 403 })
    }

    // Return member without password
    const { password: _, ...memberWithoutPassword } = member
    return NextResponse.json({ member: memberWithoutPassword })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 })
  }
}
