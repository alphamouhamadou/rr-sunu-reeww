import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email-service'

// Get all email campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const campaigns = await db.emailCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { logs: true }
        }
      }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error fetching email campaigns:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des campagnes' }, { status: 500 })
  }
}

// Create new email campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, htmlContent, textContent, targetGroup } = body

    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Nom, sujet et contenu HTML requis' }, { status: 400 })
    }

    // Calculate recipient count based on target group
    let recipientCount = 0
    
    if (targetGroup === 'all' || targetGroup === 'members') {
      const count = await db.member.count({
        where: { status: 'approved', emailVerified: true }
      })
      recipientCount += count
    }
    
    if (targetGroup === 'all' || targetGroup === 'newsletter') {
      const count = await db.newsletter.count({
        where: { isActive: true }
      })
      recipientCount += count
    }

    // Handle region-specific targeting
    if (targetGroup.startsWith('region:')) {
      const regionName = targetGroup.replace('region:', '')
      const region = await db.region.findFirst({
        where: { name: { equals: regionName, mode: 'insensitive' } }
      })
      if (region) {
        const count = await db.member.count({
          where: { 
            status: 'approved', 
            emailVerified: true,
            regionId: region.id 
          }
        })
        recipientCount = count
      }
    }

    const campaign = await db.emailCampaign.create({
      data: {
        name,
        subject,
        htmlContent,
        textContent: textContent || null,
        targetGroup: targetGroup || 'all',
        status: 'draft',
        recipientCount,
      }
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error creating email campaign:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la campagne' }, { status: 500 })
  }
}

// Send email campaign
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'ID et action requis' }, { status: 400 })
    }

    if (action === 'send') {
      return await sendCampaign(id)
    }

    if (action === 'cancel') {
      const campaign = await db.emailCampaign.update({
        where: { id },
        data: { status: 'draft' }
      })
      return NextResponse.json({ campaign })
    }

    // Generic update
    const { name, subject, htmlContent, textContent, targetGroup } = body
    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (subject) updateData.subject = subject
    if (htmlContent) updateData.htmlContent = htmlContent
    if (textContent !== undefined) updateData.textContent = textContent || null
    if (targetGroup) updateData.targetGroup = targetGroup

    const campaign = await db.emailCampaign.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error updating email campaign:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la campagne' }, { status: 500 })
  }
}

// Delete email campaign
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Delete logs first
    await db.emailLog.deleteMany({
      where: { campaignId: id }
    })

    await db.emailCampaign.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Campagne supprimée' })
  } catch (error) {
    console.error('Error deleting email campaign:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de la campagne' }, { status: 500 })
  }
}

// Helper function to send campaign
async function sendCampaign(campaignId: string) {
  const campaign = await db.emailCampaign.findUnique({
    where: { id: campaignId }
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 })
  }

  if (campaign.status === 'sent') {
    return NextResponse.json({ error: 'Cette campagne a déjà été envoyée' }, { status: 400 })
  }

  // Update status to sending
  await db.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'sending' }
  })

  let sentCount = 0
  let failedCount = 0

  try {
    // Get recipients based on target group
    const recipients: Array<{ email: string; name: string }> = []

    // Add members
    if (campaign.targetGroup === 'all' || campaign.targetGroup === 'members') {
      const members = await db.member.findMany({
        where: { status: 'approved', emailVerified: true },
        select: { email: true, firstName: true, lastName: true }
      })
      members.forEach(m => {
        recipients.push({
          email: m.email,
          name: `${m.firstName} ${m.lastName}`
        })
      })
    }

    // Add newsletter subscribers
    if (campaign.targetGroup === 'all' || campaign.targetGroup === 'newsletter') {
      const subscribers = await db.newsletter.findMany({
        where: { isActive: true },
        select: { email: true, name: true }
      })
      subscribers.forEach(s => {
        // Avoid duplicates
        if (!recipients.find(r => r.email === s.email)) {
          recipients.push({
            email: s.email,
            name: s.name || 'Abonné'
          })
        }
      })
    }

    // Handle region-specific targeting
    if (campaign.targetGroup.startsWith('region:')) {
      const regionName = campaign.targetGroup.replace('region:', '')
      const region = await db.region.findFirst({
        where: { name: { equals: regionName, mode: 'insensitive' } }
      })
      if (region) {
        const members = await db.member.findMany({
          where: { 
            status: 'approved', 
            emailVerified: true,
            regionId: region.id 
          },
          select: { email: true, firstName: true, lastName: true }
        })
        members.forEach(m => {
          recipients.push({
            email: m.email,
            name: `${m.firstName} ${m.lastName}`
          })
        })
      }
    }

    // Send emails
    for (const recipient of recipients) {
      try {
        // Replace variables in content
        let html = campaign.htmlContent
        let text = campaign.textContent || ''
        let subject = campaign.subject

        html = html.replace(/{{name}}/g, recipient.name)
        html = html.replace(/{{email}}/g, recipient.email)
        text = text.replace(/{{name}}/g, recipient.name)
        text = text.replace(/{{email}}/g, recipient.email)
        subject = subject.replace(/{{name}}/g, recipient.name)

        const sent = await sendEmail({
          to: recipient.email,
          subject,
          html,
          text
        })

        // Log the email
        await db.emailLog.create({
          data: {
            campaignId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            subject,
            status: sent ? 'sent' : 'failed',
            sentAt: sent ? new Date() : null,
          }
        })

        if (sent) {
          sentCount++
        } else {
          failedCount++
        }
      } catch (err) {
        console.error(`Failed to send to ${recipient.email}:`, err)
        failedCount++

        // Log failure
        await db.emailLog.create({
          data: {
            campaignId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            subject: campaign.subject,
            status: 'failed',
            errorMessage: String(err),
          }
        })
      }
    }

    // Update campaign status
    const updatedCampaign = await db.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        recipientCount: sentCount,
      }
    })

    return NextResponse.json({ 
      campaign: updatedCampaign,
      stats: {
        sent: sentCount,
        failed: failedCount,
        total: recipients.length
      }
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    
    // Reset status on error
    await db.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'failed' }
    })

    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la campagne' }, { status: 500 })
  }
}
