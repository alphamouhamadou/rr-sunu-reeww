import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

/**
 * Endpoint dédié pour créer/réinitialiser le compte admin.
 * 
 * Utilisation : GET /api/seed-admin
 * Appeler cette URL depuis le navigateur sur l'app déployée Vercel.
 * 
 * Identifiants admin après exécution :
 *   Email    : alphamouhamadoudiop@gmail.com
 *   Mot de passe : Thienaba10@
 */
export async function GET() {
  try {
    const adminEmail = 'alphamouhamadoudiop@gmail.com'
    const adminPlainPassword = 'Thienaba10@'

    // 1) Supprimer l'ancien admin s'il existe
    const existingAdmin = await db.member.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      // Supprimer les dépendances liées à cet admin
      await db.notification.deleteMany({ where: { memberId: existingAdmin.id } })
      await db.activityLog.deleteMany({ where: { memberId: existingAdmin.id } })
      await db.member.delete({ where: { id: existingAdmin.id } })
      console.log(`Ancien admin supprimé (id: ${existingAdmin.id})`)
    }

    // 2) Hasher le mot de passe avec bcryptjs (12 rounds)
    const hashedPassword = await hashPassword(adminPlainPassword)
    console.log(`Nouveau hash bcrypt généré: ${hashedPassword.substring(0, 20)}...`)

    // 3) Créer le nouvel admin
    const admin = await db.member.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Alpha Mouhamadou',
        lastName: 'Diop',
        dateOfBirth: '1996-12-18',
        placeOfBirth: 'Thienaba Seck',
        address: 'Thies, Sénégal',
        phone: '+221 77 621 13 39',
        cniNumber: 'ADMIN-001',
        role: 'admin',
        status: 'approved',
        membershipNumber: 'RR-ADMIN-001',
        membershipDate: new Date('2026-01-01'),
        emailVerified: true,
      }
    })

    // 4) Vérifier que le hash est bien un hash bcrypt
    const isBcrypt = admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')

    console.log(`Admin créé avec succès:`, {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      passwordIsBcrypt: isBcrypt,
      passwordPrefix: admin.password.substring(0, 30),
    })

    return NextResponse.json({ 
      success: true,
      message: 'Admin créé/réinitialisé avec succès',
      admin: {
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        status: admin.status,
        membershipNumber: admin.membershipNumber,
        passwordIsBcrypt: isBcrypt,
        passwordPrefix: admin.password.substring(0, 30),
      },
      credentials: {
        email: adminEmail,
        password: adminPlainPassword,
      },
      note: 'SUPPRIMEZ CET ENDPOINT APRÈS UTILISATION (ou protégez-le)'
    })
  } catch (error) {
    console.error('Seed admin error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la création de l\'admin: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
