import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const type = searchParams.get('type') // 'received' or 'sent'

    if (!memberId) {
      return NextResponse.json({ error: 'ID membre requis' }, { status: 400 })
    }

    const messages = await db.message.findMany({
      where: type === 'sent' 
        ? { senderId: memberId }
        : { recipientId: memberId },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 })
  }
}

// Send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, recipientId, subject, content } = body

    const message = await db.message.create({
      data: {
        senderId,
        recipientId,
        subject,
        content,
      }
    })

    return NextResponse.json({ 
      message: 'Message envoyé',
      data: message 
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 })
  }
}

// Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const message = await db.message.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Update message error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
