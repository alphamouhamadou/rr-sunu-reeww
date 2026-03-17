import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all live streams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isLive = searchParams.get('isLive')
    const limit = searchParams.get('limit')

    const where: Record<string, unknown> = {}
    if (isLive === 'true') where.isLive = true

    const streams = await db.liveStream.findMany({
      where,
      orderBy: [
        { isLive: 'desc' },
        { scheduledAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ streams })
  } catch (error) {
    console.error('Get live streams error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des lives' }, { status: 500 })
  }
}

// Create new live stream
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      platform,
      streamUrl,
      streamId,
      thumbnailUrl,
      isLive,
      scheduledAt,
    } = body

    if (!title || !platform || !streamUrl) {
      return NextResponse.json({ error: 'Le titre, la plateforme et l\'URL sont obligatoires' }, { status: 400 })
    }

    // If this stream is going live, stop all other live streams
    if (isLive) {
      await db.liveStream.updateMany({
        where: { isLive: true },
        data: { 
          isLive: false, 
          endedAt: new Date() 
        }
      })
    }

    const stream = await db.liveStream.create({
      data: {
        title,
        description,
        platform,
        streamUrl,
        streamId: streamId || extractVideoId(platform, streamUrl),
        thumbnailUrl,
        isLive: isLive || false,
        isScheduled: !!scheduledAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        startedAt: isLive ? new Date() : null,
      }
    })

    return NextResponse.json({ stream })
  } catch (error) {
    console.error('Create live stream error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du live' }, { status: 500 })
  }
}

// Update live stream
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isLive, ...data } = body

    const updateData: Record<string, unknown> = { ...data }

    // Handle going live
    if (isLive !== undefined) {
      if (isLive) {
        // Stop all other live streams
        await db.liveStream.updateMany({
          where: { isLive: true, id: { not: id } },
          data: { 
            isLive: false, 
            endedAt: new Date() 
          }
        })
        updateData.isLive = true
        updateData.startedAt = new Date()
        updateData.endedAt = null
      } else {
        updateData.isLive = false
        updateData.endedAt = new Date()
      }
    }

    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt)
      updateData.isScheduled = true
    }

    const stream = await db.liveStream.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ stream })
  } catch (error) {
    console.error('Update live stream error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du live' }, { status: 500 })
  }
}

// Delete live stream
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.liveStream.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete live stream error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du live' }, { status: 500 })
  }
}

// Helper function to extract video ID from URL
function extractVideoId(platform: string, url: string): string | null {
  try {
    if (platform === 'youtube') {
      // YouTube URL patterns
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
      ]
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
      }
    } else if (platform === 'facebook') {
      // Facebook video ID pattern
      const match = url.match(/videos\/(\d+)/)
      if (match) return match[1]
    }
    return null
  } catch {
    return null
  }
}
