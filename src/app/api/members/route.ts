import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { sendEmail, generateWelcomeEmail, generateRejectionEmail, generateRegistrationConfirmationEmail } from '@/lib/email-service'
import { logActivity } from '@/lib/activity-logger'
import crypto from 'crypto'

// Generate next membership number safely by finding the max existing one
async function generateNextMembershipNumber(): Promise<string> {
  // Find the member with the highest numeric part of membershipNumber
  const members = await db.member.findMany({
    where: { membershipNumber: { not: null, startsWith: 'SN-RR-' } },
    select: { membershipNumber: true },
    orderBy: { membershipNumber: 'desc' },
    take: 1,
  })

  let nextNum = 1
  if (members.length > 0 && members[0].membershipNumber) {
    const parts = members[0].membershipNumber.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1
    }
  }

  return `SN-RR-${String(nextNum).padStart(6, '0')}`
}

// Get all members (admin) or register new member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const regionId = searchParams.get('regionId')
    const residenceType = searchParams.get('residenceType')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (role) where.role = role
    if (regionId) where.regionId = regionId
    if (residenceType) where.residenceType = residenceType

    const members = await db.member.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        photo: true,
        dateOfBirth: true,
        placeOfBirth: true,
        address: true,
        cniNumber: true,
        role: true,
        status: true,
        membershipNumber: true,
        membershipDate: true,
        residenceType: true,
        country: true,
        cityAbroad: true,
        hasVoterCard: true,
        voterCardNumber: true,
        hasPaidCard: true,
        cardPaidAt: true,
        createdAt: true,
        region: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        commune: { select: { id: true, name: true } },
        _count: {
          select: {
            contributions: true,
            donations: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des membres' }, { status: 500 })
  }
}

// Register new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      firstName, 
      lastName, 
      dateOfBirth, 
      placeOfBirth,
      address, 
      phone, 
      cniNumber,
      photo,
      residenceType,
      isDiaspora,
      regionId,
      departmentId,
      communeId,
      country,
      cityAbroad,
      hasVoterCard,
      voterCardNumber,
    } = body

    // Validation des champs obligatoires
    if (!email || !firstName || !lastName || !dateOfBirth || !placeOfBirth || !address || !phone || !cniNumber) {
      return NextResponse.json({ error: 'Tous les champs obligatoires doivent être remplis' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await db.member.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Check if CNI already exists
    const existingCNI = await db.member.findFirst({
      where: { cniNumber: cniNumber.trim() }
    })

    if (existingCNI) {
      return NextResponse.json({ error: 'Ce numéro de carte d\'identité est déjà enregistré' }, { status: 400 })
    }

    // Check if phone already exists
    const existingPhone = await db.member.findFirst({
      where: { phone: phone.trim() }
    })

    if (existingPhone) {
      return NextResponse.json({ error: 'Ce numéro de téléphone est déjà enregistré' }, { status: 400 })
    }

    // Déterminer le type de résidence
    const memberResidenceType = residenceType || (isDiaspora ? 'diaspora' : 'senegal')

    // Validation spécifique selon le type de résidence
    if (memberResidenceType === 'senegal') {
      if (!regionId || !departmentId || !communeId) {
        return NextResponse.json({ error: 'La région, le département et la commune sont obligatoires pour les résidents au Sénégal' }, { status: 400 })
      }
    } else {
      if (!country || !cityAbroad) {
        return NextResponse.json({ error: 'Le pays et la ville de résidence sont obligatoires pour la diaspora' }, { status: 400 })
      }
    }

    // Validation carte d'électeur
    if (hasVoterCard && !voterCardNumber) {
      return NextResponse.json({ error: 'Le numéro de carte d\'électeur est obligatoire si vous en possédez une' }, { status: 400 })
    }

    // Auto-generate a random password (not needed for public users, but required by DB schema)
    const autoPassword = crypto.randomBytes(16).toString('hex')
    const hashedPassword = await hashPassword(autoPassword)

    // Auto-approve: generate membership number immediately (no admin approval needed)
    let membershipNumber = await generateNextMembershipNumber()

    // Retry with increment if unique constraint fails (race condition safety)
    let member = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        member = await db.member.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            dateOfBirth,
            placeOfBirth,
            address,
            phone,
            cniNumber,
            photo: photo || null,
            residenceType: memberResidenceType,
            regionId: memberResidenceType === 'senegal' ? regionId : null,
            departmentId: memberResidenceType === 'senegal' ? departmentId : null,
            communeId: memberResidenceType === 'senegal' ? communeId : null,
            country: memberResidenceType === 'diaspora' ? country : null,
            cityAbroad: memberResidenceType === 'diaspora' ? cityAbroad : null,
            hasVoterCard: hasVoterCard || false,
            voterCardNumber: hasVoterCard ? voterCardNumber : null,
            role: 'member',
            status: 'approved',
            emailVerified: true,
            membershipNumber,
            membershipDate: new Date(),
          }
        })
        break // Success, exit retry loop
      } catch (err: unknown) {
        const prismaErr = err as { code?: string }
        if (prismaErr.code === 'P2002' && attempt < 2) {
          // Unique constraint failed, generate next number and retry
          const parts = membershipNumber.split('-')
          const num = parseInt(parts[parts.length - 1], 10)
          membershipNumber = `SN-RR-${String(num + 1).padStart(6, '0')}`
          continue
        }
        throw err
      }
    }

    if (!member) {
      return NextResponse.json({ error: 'Erreur lors de la génération du numéro de membre' }, { status: 500 })
    }

    // Log auto-approval activity
    logActivity({
      action: 'create',
      entityType: 'member',
      entityId: member.id,
      details: JSON.stringify({ membershipNumber, autoApproved: true }),
    }).catch(() => {})

    // Send welcome email with membership number (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailData = generateWelcomeEmail({
      memberName: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      membershipNumber,
      loginUrl: appUrl
    })

    sendEmail({
      to: email.toLowerCase(),
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    }).catch(err => console.error('Failed to send welcome email:', err))

    return NextResponse.json({ 
      message: 'Inscription réussie ! Vous êtes maintenant membre de Renaissance Républicaine Sunu Reew.',
      memberId: member.id,
      membershipNumber,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 })
  }
}

// Update member status (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, role } = body

    // Get current member info before update
    const currentMember = await db.member.findUnique({
      where: { id },
      select: { 
        email: true, 
        firstName: true, 
        lastName: true, 
        status: true,
        emailVerified: true 
      }
    })

    if (!currentMember) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === 'approved') {
        // Generate membership number
        const membershipNumber = await generateNextMembershipNumber()
        updateData.membershipNumber = membershipNumber
        updateData.membershipDate = new Date()
      }
    }
    if (role) updateData.role = role

    const member = await db.member.update({
      where: { id },
      data: updateData,
    })

    // Send email notification on status change
    if (status) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      if (status === 'approved' && currentMember.status !== 'approved') {
        const emailData = generateWelcomeEmail({
          memberName: `${member.firstName} ${member.lastName}`,
          email: member.email,
          membershipNumber: member.membershipNumber || '',
          loginUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        })
        
        sendEmail({
          to: member.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        }).catch(err => console.error('Failed to send welcome email:', err))
      }
      
      if (status === 'rejected' && currentMember.status !== 'rejected') {
        const emailData = generateRejectionEmail({
          memberName: `${member.firstName} ${member.lastName}`,
          email: member.email
        })
        
        sendEmail({
          to: member.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        }).catch(err => console.error('Failed to send rejection email:', err))
      }
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// Delete member (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID du membre requis' }, { status: 400 })
    }

    const member = await db.member.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contributions: true,
            donations: true,
            sentMessages: true,
            receivedMessages: true,
            notifications: true,
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    if (member.role === 'admin') {
      const adminCount = await db.member.count({ where: { role: 'admin' } })
      if (adminCount <= 1) {
        return NextResponse.json({ 
          error: 'Impossible de supprimer le dernier administrateur' 
        }, { status: 400 })
      }
    }

    await db.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { memberId: id } })
      await tx.message.deleteMany({ where: { senderId: id } })
      await tx.message.deleteMany({ where: { recipientId: id } })
      await tx.contribution.deleteMany({ where: { memberId: id } })
      await tx.donation.updateMany({
        where: { memberId: id },
        data: { memberId: null }
      })
      await tx.member.delete({ where: { id } })
    })

    return NextResponse.json({ 
      success: true, 
      message: `Membre ${member.firstName} ${member.lastName} supprimé avec succès` 
    })
  } catch (error) {
    console.error('Delete member error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du membre' }, { status: 500 })
  }
}
