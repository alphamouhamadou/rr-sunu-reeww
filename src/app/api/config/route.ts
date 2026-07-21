import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Récupérer la configuration
export async function GET() {
  try {
    let config = await db.platformConfig.findFirst()

    if (!config) {
      config = await db.platformConfig.create({ data: {} })
    }

    // Masquer les secrets
    const safeConfig = {
      ...config,
      paytechApiKey: config.paytechApiKey ? '••••••••' + (config.paytechApiKey.slice(-4) || '') : null,
      paytechSecretKey: config.paytechSecretKey ? '••••••••••••' : null,
    }

    return NextResponse.json({ config: safeConfig })
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
  }
}

// PATCH - Mettre à jour la configuration
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    let config = await db.platformConfig.findFirst()

    if (!config) {
      config = await db.platformConfig.create({ data: {} })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['paytechApiKey', 'paytechSecretKey', 'paytechMode', 'contributionAmount', 'gracePeriodDays']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Ne pas mettre à jour si le champ contient des • (déjà masqué)
        if (field === 'paytechApiKey' || field === 'paytechSecretKey') {
          if (body[field] && !body[field].includes('•')) {
            updateData[field] = body[field]
          }
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const updatedConfig = await db.platformConfig.update({
      where: { id: config.id },
      data: updateData
    })

    const safeConfig = {
      ...updatedConfig,
      paytechApiKey: updatedConfig.paytechApiKey ? '••••••••' + (updatedConfig.paytechApiKey.slice(-4) || '') : null,
      paytechSecretKey: updatedConfig.paytechSecretKey ? '••••••••••••' : null,
    }

    return NextResponse.json({ config: safeConfig })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}