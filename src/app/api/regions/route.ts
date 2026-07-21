import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all regions with departments and communes
export async function GET() {
  try {
    const regions = await db.region.findMany({
      include: {
        departments: {
          include: {
            communes: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ 
      regions,
      stats: {
        regions: regions.length,
        departments: regions.reduce((sum, r) => sum + r.departments.length, 0),
        communes: regions.reduce((sum, r) => sum + r.departments.reduce((s, d) => s + d.communes.length, 0), 0)
      }
    })
  } catch (error) {
    console.error('Get regions error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des régions' }, { status: 500 })
  }
}
