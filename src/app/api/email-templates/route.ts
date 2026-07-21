import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all email templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const templates = await db.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des templates' }, { status: 500 })
  }
}

// Create new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, htmlContent, textContent, variables, category, isDefault } = body

    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Nom, sujet et contenu HTML requis' }, { status: 400 })
    }

    // Check if name already exists
    const existing = await db.emailTemplate.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json({ error: 'Un template avec ce nom existe déjà' }, { status: 400 })
    }

    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        htmlContent,
        textContent: textContent || null,
        variables: variables ? JSON.stringify(variables) : null,
        category: category || 'general',
        isDefault: isDefault || false,
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du template' }, { status: 500 })
  }
}

// Update email template
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, subject, htmlContent, textContent, variables, category, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (subject) updateData.subject = subject
    if (htmlContent) updateData.htmlContent = htmlContent
    if (textContent !== undefined) updateData.textContent = textContent || null
    if (variables) updateData.variables = JSON.stringify(variables)
    if (category) updateData.category = category
    if (isDefault !== undefined) updateData.isDefault = isDefault

    const template = await db.emailTemplate.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du template' }, { status: 500 })
  }
}

// Delete email template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Template supprimé' })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du template' }, { status: 500 })
  }
}
