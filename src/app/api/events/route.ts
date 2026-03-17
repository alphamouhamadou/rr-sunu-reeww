import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = { isPublished: true }
    
    if (upcoming === 'true') {
      where.date = { gte: new Date() }
    }

    const events = await db.event.findMany({
      where,
      orderBy: { date: 'asc' },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des événements' }, { status: 500 })
  }
}

// Create event (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, endDate, location, regionId, imageUrl } = body

    const event = await db.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location,
        regionId,
        imageUrl,
        isPublished: true,
      }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'événement' }, { status: 500 })
  }
}

// Update event (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (data.date) data.date = new Date(data.date)
    if (data.endDate) data.endDate = new Date(data.endDate)

    const event = await db.event.update({
      where: { id },
      data,
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// Delete event (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.event.delete({ where: { id } })

    return NextResponse.json({ message: 'Événement supprimé' })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
