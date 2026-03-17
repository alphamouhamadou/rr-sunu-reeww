import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all settings or a specific setting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const setting = await db.setting.findUnique({
        where: { key }
      })
      return NextResponse.json({ setting })
    }

    const settings = await db.setting.findMany()
    
    // Convert to object for easier access
    const settingsObj: Record<string, string> = {}
    settings.forEach(s => {
      settingsObj[s.key] = s.value
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des paramètres' }, { status: 500 })
  }
}

// Update or create settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    // Update or create each setting
    const results = []
    for (const [key, value] of Object.entries(settings)) {
      const setting = await db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
      results.push(setting)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Paramètres mis à jour avec succès',
      settings: results 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des paramètres' }, { status: 500 })
  }
}

// Delete a setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Clé requise' }, { status: 400 })
    }

    await db.setting.delete({
      where: { key }
    })

    return NextResponse.json({ success: true, message: 'Paramètre supprimé' })
  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
