import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateContributionReminderEmail, sendEmail } from '@/lib/email-service'

// Get members with overdue contributions and send reminders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const send = searchParams.get('send') === 'true'

    // Get current month
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM

    // Get approved members with their contributions
    const members = await db.member.findMany({
      where: {
        status: 'approved',
        role: 'member',
        ...(memberId ? { id: memberId } : {})
      },
      include: {
        contributions: {
          where: {
            status: 'completed'
          },
          select: {
            month: true
          }
        }
      }
    })

    // Find members with missing contributions
    const overdueMembers: Array<{
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string
      membershipNumber: string | null
      monthsOverdue: string[]
    }> = []

    for (const member of members) {
      // Check last 3 months
      const monthsToCheck: string[] = []
      for (let i = 1; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        monthsToCheck.push(d.toISOString().slice(0, 7))
      }

      const paidMonths = member.contributions.map(c => c.month)
      const unpaidMonths = monthsToCheck.filter(m => !paidMonths.includes(m))

      if (unpaidMonths.length > 0) {
        overdueMembers.push({
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          membershipNumber: member.membershipNumber,
          monthsOverdue: unpaidMonths.map(m => {
            const [year, month] = m.split('-')
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
            return monthNames[parseInt(month) - 1] + ' ' + year
          })
        })
      }
    }

    // Send emails if requested
    const results: Array<{
      member: string
      email: string
      status: string
    }> = []

    if (send) {
      for (const member of overdueMembers) {
        const emailData = generateContributionReminderEmail({
          memberName: member.firstName + ' ' + member.lastName,
          membershipNumber: member.membershipNumber || 'N/A',
          email: member.email,
          phone: member.phone,
          contributionAmount: 5000, // Montant par défaut
          monthsOverdue: member.monthsOverdue
        })

        const sent = await sendEmail({
          to: member.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text
        })

        results.push({
          member: member.firstName + ' ' + member.lastName,
          email: member.email,
          status: sent ? 'Envoyé' : 'Échec'
        })
      }
    }

    return NextResponse.json({
      currentMonth,
      overdueCount: overdueMembers.length,
      overdueMembers: overdueMembers.map(m => ({
        id: m.id,
        name: m.firstName + ' ' + m.lastName,
        email: m.email,
        membershipNumber: m.membershipNumber,
        monthsOverdue: m.monthsOverdue
      })),
      ...(send ? { emailResults: results } : {})
    })
  } catch (error) {
    console.error('Get overdue members error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des cotisations en retard' }, { status: 500 })
  }
}

// Send reminder to specific member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, customMessage } = body

    if (!memberId) {
      return NextResponse.json({ error: 'ID membre requis' }, { status: 400 })
    }

    // Get member
    const member = await db.member.findUnique({
      where: { id: memberId },
      include: {
        contributions: {
          where: { status: 'completed' },
          select: { month: true }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Find overdue months
    const now = new Date()
    const monthsToCheck: string[] = []
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthsToCheck.push(d.toISOString().slice(0, 7))
    }

    const paidMonths = member.contributions.map(c => c.month)
    const unpaidMonths = monthsToCheck.filter(m => !paidMonths.includes(m))

    if (unpaidMonths.length === 0) {
      return NextResponse.json({ message: 'Ce membre est à jour de ses cotisations' })
    }

    const monthsOverdue = unpaidMonths.map(m => {
      const [year, month] = m.split('-')
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      return monthNames[parseInt(month) - 1] + ' ' + year
    })

    // Generate and send email
    const emailData = generateContributionReminderEmail({
      memberName: member.firstName + ' ' + member.lastName,
      membershipNumber: member.membershipNumber || 'N/A',
      email: member.email,
      phone: member.phone,
      contributionAmount: 5000,
      monthsOverdue,
      ...(customMessage ? { customMessage } : {})
    })

    const sent = await sendEmail({
      to: member.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    })

    // Log notification
    await db.notification.create({
      data: {
        memberId: member.id,
        title: 'Rappel de cotisation',
        message: 'Un rappel de cotisation vous a été envoyé par email pour: ' + monthsOverdue.join(', '),
        type: 'alert'
      }
    })

    return NextResponse.json({
      success: sent,
      message: sent ? 'Rappel envoyé avec succès' : 'Erreur lors de l\'envoi du rappel',
      monthsOverdue
    })
  } catch (error) {
    console.error('Send reminder error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du rappel' }, { status: 500 })
  }
}
