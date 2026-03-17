import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get notifications for a member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    // If no memberId, return all notifications (for admin)
    if (!memberId) {
      const notifications = await db.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      return NextResponse.json({ notifications })
    }

    const notifications = await db.notification.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 })
  }
}

// Create notification (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, targetRole, regionId } = body

    // Build where clause for targeting
    const where: Record<string, unknown> = { status: 'approved' }
    if (targetRole) where.role = targetRole
    if (regionId) where.regionId = regionId

    // Get target members
    const members = await db.member.findMany({
      where,
      select: { id: true }
    })

    // Create notifications for all targets
    const notifications = await Promise.all(
      members.map(member =>
        db.notification.create({
          data: {
            memberId: member.id,
            title,
            message,
            type: type || 'info',
          }
        })
      )
    )

    return NextResponse.json({ 
      message: `${notifications.length} notifications envoyées`,
      count: notifications.length 
    })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi des notifications' }, { status: 500 })
  }
}

// Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, memberId } = body

    if (id) {
      await db.notification.update({
        where: { id },
        data: { isRead: true }
      })
    } else if (memberId) {
      await db.notification.updateMany({
        where: { memberId },
        data: { isRead: true }
      })
    }

    return NextResponse.json({ message: 'Notifications marquées comme lues' })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
