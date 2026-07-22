import jsPDF from 'jspdf'

export interface CardMemberData {
  firstName: string
  lastName: string
  membershipNumber: string
  phone?: string
  email?: string
  membershipDate?: string
}

export function generateCardPDF(member: CardMemberData) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 53.98],
  })

  const w = 85.6
  const h = 53.98

  doc.setFillColor(0, 135, 81)
  doc.rect(0, 0, w, h, 'F')

  doc.setFillColor(212, 175, 55)
  doc.rect(0, 0, w, 3, 'F')
  doc.rect(0, h - 3, w, 3, 'F')

  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('RR', 5, 14)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('SUNU REEWW', 5, 18)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CARTE DE MEMBRE', w - 5, 10, { align: 'right' })

  const fullName = `${member.firstName} ${member.lastName}`.toUpperCase()
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(fullName, w / 2, 26, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${member.membershipNumber}`, w / 2, 32, { align: 'center' })

  if (member.phone) {
    doc.setFontSize(7)
    doc.text(member.phone, w / 2, 38, { align: 'center' })
  }

  if (member.email) {
    doc.setFontSize(6)
    doc.text(member.email, w / 2, 42, { align: 'center' })
  }

  if (member.membershipDate) {
    const date = new Date(member.membershipDate).toLocaleDateString('fr-FR')
    doc.setFontSize(6)
    doc.text(`Adhérent depuis ${date}`, w / 2, h - 6, { align: 'center' })
  }

  doc.save(`carte-membre-${member.membershipNumber}.pdf`)
}