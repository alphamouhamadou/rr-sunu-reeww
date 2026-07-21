import { NextRequest, NextResponse } from 'next/server'
import { getActivityLogs } from '@/lib/activity-logger'

// Get activity logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action') || undefined
    const entityType = searchParams.get('entityType') || undefined
    const memberId = searchParams.get('memberId') || undefined

    const result = await getActivityLogs({
      limit,
      offset,
      action,
      entityType,
      memberId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get activity logs error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des logs' }, { status: 500 })
  }
}
