import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

// Get members data for export
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json, excel, pdf
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const regionId = searchParams.get('regionId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (role) where.role = role
    if (regionId) where.regionId = regionId

    const members = await db.member.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        placeOfBirth: true,
        address: true,
        cniNumber: true,
        role: true,
        status: true,
        membershipNumber: true,
        membershipDate: true,
        residenceType: true,
        country: true,
        cityAbroad: true,
        hasVoterCard: true,
        voterCardNumber: true,
        createdAt: true,
        region: { select: { name: true } },
        department: { select: { name: true } },
        commune: { select: { name: true } },
        _count: {
          select: {
            contributions: true,
            donations: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format data for export
    const exportData = members.map((m, index) => ({
      'N°': index + 1,
      'N° Membre': m.membershipNumber || '-',
      'Prénom': m.firstName,
      'Nom': m.lastName,
      'Email': m.email,
      'Téléphone': m.phone,
      'Date de naissance': m.dateOfBirth || '-',
      'Lieu de naissance': m.placeOfBirth || '-',
      'Adresse': m.address || '-',
      'N° CNI': m.cniNumber || '-',
      'Région': m.region?.name || '-',
      'Département': m.department?.name || '-',
      'Commune': m.commune?.name || '-',
      'Pays (Diaspora)': m.country || '-',
      'Ville (Diaspora)': m.cityAbroad || '-',
      'Type résidence': m.residenceType === 'diaspora' ? 'Diaspora' : 'Sénégal',
      'Carte électeur': m.hasVoterCard ? 'Oui' : 'Non',
      'Rôle': m.role === 'admin' ? 'Administrateur' : 'Membre',
      'Statut': m.status === 'approved' ? 'Validé' : m.status === 'pending' ? 'En attente' : 'Rejeté',
      'Date inscription': new Date(m.createdAt).toLocaleDateString('fr-FR'),
      'Date adhésion': m.membershipDate ? new Date(m.membershipDate).toLocaleDateString('fr-FR') : '-',
      'Nb Cotisations': m._count.contributions,
      'Nb Dons': m._count.donations,
    }))

    if (format === 'excel') {
      // Create workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // N°
        { wch: 15 },  // N° Membre
        { wch: 15 },  // Prénom
        { wch: 15 },  // Nom
        { wch: 25 },  // Email
        { wch: 15 },  // Téléphone
        { wch: 12 },  // Date naissance
        { wch: 15 },  // Lieu naissance
        { wch: 25 },  // Adresse
        { wch: 15 },  // CNI
        { wch: 15 },  // Région
        { wch: 15 },  // Département
        { wch: 15 },  // Commune
        { wch: 15 },  // Pays
        { wch: 15 },  // Ville
        { wch: 12 },  // Type résidence
        { wch: 10 },  // Carte électeur
        { wch: 12 },  // Rôle
        { wch: 10 },  // Statut
        { wch: 12 },  // Date inscription
        { wch: 12 },  // Date adhésion
        { wch: 10 },  // Nb Cotisations
        { wch: 10 },  // Nb Dons
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Membres')

      // Generate buffer
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="membres-rr-sunu-reew-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }

    if (format === 'pdf') {
      // Return data for client-side PDF generation
      return NextResponse.json({ 
        members: members.map((m, index) => ({
          index: index + 1,
          membershipNumber: m.membershipNumber || '-',
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          phone: m.phone,
          region: m.region?.name || '-',
          role: m.role === 'admin' ? 'Admin' : 'Membre',
          status: m.status === 'approved' ? 'Validé' : m.status === 'pending' ? 'En attente' : 'Rejeté',
        })),
        total: members.length
      })
    }

    // Default JSON response
    return NextResponse.json({ 
      members: exportData,
      total: exportData.length,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Export members error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'export des membres' }, { status: 500 })
  }
}