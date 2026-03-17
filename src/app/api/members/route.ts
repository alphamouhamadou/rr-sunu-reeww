import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateVerificationToken } from '@/lib/password'
import { sendEmail, generateWelcomeEmail, generateRejectionEmail, generateVerificationEmail, generateRegistrationConfirmationEmail } from '@/lib/email-service'

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
      password, 
      firstName, 
      lastName, 
      dateOfBirth, 
      placeOfBirth,
      address, 
      phone, 
      cniNumber,
      photo,
      // Type de résidence
      residenceType,
      isDiaspora,
      // Pour les résidents au Sénégal
      regionId,
      departmentId,
      communeId,
      // Pour la diaspora
      country,
      cityAbroad,
      // Carte d'électeur
      hasVoterCard,
      voterCardNumber,
    } = body

    // Validation des champs obligatoires
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !placeOfBirth || !address || !phone || !cniNumber) {
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

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password)
    
    // Generate email verification token
    const { token: verificationToken, expiry: verificationTokenExpiry } = generateVerificationToken()

    const member = await db.member.create({
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
        // Champs pour les résidents au Sénégal
        regionId: memberResidenceType === 'senegal' ? regionId : null,
        departmentId: memberResidenceType === 'senegal' ? departmentId : null,
        communeId: memberResidenceType === 'senegal' ? communeId : null,
        // Champs pour la diaspora
        country: memberResidenceType === 'diaspora' ? country : null,
        cityAbroad: memberResidenceType === 'diaspora' ? cityAbroad : null,
        // Carte d'électeur
        hasVoterCard: hasVoterCard || false,
        voterCardNumber: hasVoterCard ? voterCardNumber : null,
        role: 'member',
        status: 'pending',
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      }
    })

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${appUrl}/api/auth/verify?token=${verificationToken}`
    
    // Send verification email
    const verificationEmailData = generateVerificationEmail({
      memberName: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      verificationUrl
    })
    
    // Also send registration confirmation
    const confirmationEmailData = generateRegistrationConfirmationEmail({
      memberName: `${firstName} ${lastName}`,
      email: email.toLowerCase()
    })
    
    // Send emails (non-blocking)
    Promise.all([
      sendEmail({
        to: email.toLowerCase(),
        subject: verificationEmailData.subject,
        html: verificationEmailData.html,
        text: verificationEmailData.text
      }),
      sendEmail({
        to: email.toLowerCase(),
        subject: confirmationEmailData.subject,
        html: confirmationEmailData.html,
        text: confirmationEmailData.text
      })
    ]).catch(err => console.error('Failed to send registration emails:', err))

    return NextResponse.json({ 
      message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
      memberId: member.id,
      verificationUrl: process.env.NODE_ENV === 'development' ? verificationUrl : undefined,
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
        const count = await db.member.count({ where: { status: 'approved' } })
        const membershipNumber = `SN-RR-${String(count + 1).padStart(6, '0')}`
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
    if (status && currentMember.emailVerified) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      if (status === 'approved' && currentMember.status !== 'approved') {
        // Send welcome email
        const emailData = generateWelcomeEmail({
          memberName: `${member.firstName} ${member.lastName}`,
          email: member.email,
          membershipNumber: member.membershipNumber || '',
          loginUrl: `${appUrl}?section=login`
        })
        
        // Send email (non-blocking)
        sendEmail({
          to: member.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        }).catch(err => console.error('Failed to send welcome email:', err))
      }
      
      if (status === 'rejected' && currentMember.status !== 'rejected') {
        // Send rejection email
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

    // Check if member exists
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

    // Prevent deleting the last admin
    if (member.role === 'admin') {
      const adminCount = await db.member.count({ where: { role: 'admin' } })
      if (adminCount <= 1) {
        return NextResponse.json({ 
          error: 'Impossible de supprimer le dernier administrateur' 
        }, { status: 400 })
      }
    }

    // Delete related records first (cascade)
    await db.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({ where: { memberId: id } })
      
      // Delete messages (sent and received)
      await tx.message.deleteMany({ where: { senderId: id } })
      await tx.message.deleteMany({ where: { recipientId: id } })
      
      // Delete contributions
      await tx.contribution.deleteMany({ where: { memberId: id } })
      
      // Delete donations (set memberId to null for anonymous donations)
      await tx.donation.updateMany({
        where: { memberId: id },
        data: { memberId: null }
      })
      
      // Finally delete the member
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
