import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all newsletter subscriptions (admin only)
export async function GET() {
  try {
    const subscriptions = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions
    })
  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des abonnements' },
      { status: 500 }
    )
  }
}

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: 'Cette adresse email est déjà inscrite' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email: email.toLowerCase() },
          data: { isActive: true, name: name || existing.name }
        })
        return NextResponse.json({
          success: true,
          message: 'Votre inscription a été réactivée avec succès !'
        })
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletter.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'website',
        isActive: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Merci de rejoindre notre newsletter.',
      subscription: {
        id: subscription.id,
        email: subscription.email
      }
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Adresse email requise' },
        { status: 400 }
      )
    }

    const subscription = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Adresse email non trouvée' },
        { status: 404 }
      )
    }

    await prisma.newsletter.update({
      where: { email: email.toLowerCase() },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Vous avez été désinscrit de notre newsletter'
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la désinscription' },
      { status: 500 }
    )
  }
}
