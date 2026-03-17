import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/activity-logger'

// Bulk actions on members
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, memberIds, data } = body

    if (!action || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'Action et IDs des membres requis' }, { status: 400 })
    }

    let result
    
    switch (action) {
      case 'approve':
        // Approve multiple members
        result = await db.$transaction(async (tx) => {
          const updated = []
          for (const id of memberIds) {
            // Get current member
            const current = await tx.member.findUnique({ where: { id } })
            if (!current || current.status === 'approved') continue
            
            // Generate membership number
            const count = await tx.member.count({ where: { status: 'approved' } })
            const membershipNumber = `RR-${String(count + updated.length + 1).padStart(6, '0')}`
            
            const member = await tx.member.update({
              where: { id },
              data: {
                status: 'approved',
                membershipNumber,
                membershipDate: new Date()
              }
            })
            updated.push(member)
          }
          return updated
        })
        
        await logActivity({
          action: 'bulk_approve',
          entityType: 'member',
          details: JSON.stringify({ count: result.length, memberIds })
        })
        break

      case 'reject':
        // Reject multiple members
        result = await db.member.updateMany({
          where: { 
            id: { in: memberIds },
            status: 'pending' 
          },
          data: { status: 'rejected' }
        })
        
        await logActivity({
          action: 'bulk_reject',
          entityType: 'member',
          details: JSON.stringify({ count: result.count, memberIds })
        })
        break

      case 'delete':
        // Delete multiple members (admin only, with protections)
        result = await db.$transaction(async (tx) => {
          // Check for admins
          const adminsToDelete = await tx.member.findMany({
            where: { 
              id: { in: memberIds },
              role: 'admin'
            }
          })
          
          if (adminsToDelete.length > 0) {
            const totalAdmins = await tx.member.count({ where: { role: 'admin' } })
            if (totalAdmins - adminsToDelete.length < 1) {
              throw new Error('Impossible de supprimer tous les administrateurs')
            }
          }
          
          // Delete related records
          await tx.notification.deleteMany({ where: { memberId: { in: memberIds } } })
          await tx.message.deleteMany({ where: { senderId: { in: memberIds } } })
          await tx.message.deleteMany({ where: { recipientId: { in: memberIds } } })
          await tx.contribution.deleteMany({ where: { memberId: { in: memberIds } } })
          await tx.donation.updateMany({
            where: { memberId: { in: memberIds } },
            data: { memberId: null }
          })
          
          // Delete members
          return await tx.member.deleteMany({
            where: { id: { in: memberIds } }
          })
        })
        
        await logActivity({
          action: 'bulk_delete',
          entityType: 'member',
          details: JSON.stringify({ count: result.count, memberIds })
        })
        break

      case 'changeRole':
        // Change role for multiple members
        if (!data?.role || !['admin', 'member'].includes(data.role)) {
          return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
        }
        
        result = await db.member.updateMany({
          where: { id: { in: memberIds } },
          data: { role: data.role }
        })
        
        await logActivity({
          action: 'bulk_change_role',
          entityType: 'member',
          details: JSON.stringify({ count: result.count, memberIds, newRole: data.role })
        })
        break

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      action,
      affected: result.count || result.length || 0 
    })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur lors de l\'action groupée' 
    }, { status: 500 })
  }
}
