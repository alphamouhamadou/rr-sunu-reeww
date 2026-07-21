import { db } from '@/lib/db'

interface LogActivityParams {
  action: string
  entityType: string
  entityId?: string
  memberId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

export async function logActivity(params: LogActivityParams) {
  try {
    await db.activityLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        memberId: params.memberId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - logging should not break the main operation
  }
}

export async function getActivityLogs(options: {
  limit?: number
  offset?: number
  action?: string
  entityType?: string
  memberId?: string
}) {
  const { limit = 50, offset = 0, action, entityType, memberId } = options

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (entityType) where.entityType = entityType
  if (memberId) where.memberId = memberId

  const [logs, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.activityLog.count({ where })
  ])

  return { logs, total }
}

export function formatLogAction(action: string): string {
  const actionMap: Record<string, string> = {
    'create': 'Création',
    'update': 'Modification',
    'delete': 'Suppression',
    'approve': 'Approbation',
    'reject': 'Rejet',
    'bulk_approve': 'Approbation groupée',
    'bulk_reject': 'Rejet groupé',
    'bulk_delete': 'Suppression groupée',
    'bulk_change_role': 'Changement de rôle groupé',
    'login': 'Connexion',
    'logout': 'Déconnexion',
    'payment': 'Paiement',
    'export': 'Export',
    'import': 'Import',
  }
  
  return actionMap[action] || action
}

export function formatLogEntityType(entityType: string): string {
  const entityMap: Record<string, string> = {
    'member': 'Membre',
    'article': 'Article',
    'event': 'Événement',
    'donation': 'Don',
    'contribution': 'Cotisation',
    'livestream': 'Live',
    'notification': 'Notification',
    'setting': 'Configuration',
  }
  
  return entityMap[entityType] || entityType
}
