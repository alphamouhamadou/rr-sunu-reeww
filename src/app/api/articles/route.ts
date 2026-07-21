import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = { isPublished: true }
    if (featured === 'true') where.isFeatured = true
    if (category) where.category = category

    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Get articles error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des articles' }, { status: 500 })
  }
}

// Create article (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, category, imageUrl, isFeatured } = body

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const article = await db.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        category: category || 'actualite',
        imageUrl,
        isFeatured: isFeatured || false,
        isPublished: true,
      }
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'article' }, { status: 500 })
  }
}

// Update article (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const article = await db.article.update({
      where: { id },
      data,
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Update article error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// Delete article (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.article.delete({ where: { id } })

    return NextResponse.json({ message: 'Article supprimé' })
  } catch (error) {
    console.error('Delete article error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
