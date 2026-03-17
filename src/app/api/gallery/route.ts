import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all gallery photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { isPublished: true }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (featured === 'true') {
      where.isFeatured = true
    }

    const photos = await db.galleryPhoto.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching gallery photos:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Create new gallery photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, imageUrl, thumbnailUrl, category, eventId, isFeatured } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Titre et image requis' }, { status: 400 })
    }

    // Get max display order
    const maxOrder = await db.galleryPhoto.aggregate({
      _max: { displayOrder: true }
    })
    const displayOrder = (maxOrder._max.displayOrder || 0) + 1

    const photo = await db.galleryPhoto.create({
      data: {
        title,
        description,
        imageUrl,
        thumbnailUrl,
        category: category || 'general',
        eventId,
        isFeatured: isFeatured || false,
        displayOrder
      }
    })

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('Error creating gallery photo:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// Update gallery photo
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const photo = await db.galleryPhoto.update({
      where: { id },
      data
    })

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('Error updating gallery photo:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// Delete gallery photo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.galleryPhoto.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery photo:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
