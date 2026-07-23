import jsPDF from 'jspdf'
import QRCode from 'qrcode'

export interface CardMemberData {
  firstName: string
  lastName: string
  membershipNumber: string
  phone?: string
  email?: string
  membershipDate?: string
  photo?: string | null
  department?: { name: string } | null
  commune?: { name: string } | null
  cityAbroad?: string | null
  country?: string | null
  region?: { name: string } | null
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = url
  })
}

export async function generateCardPDF(member: CardMemberData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [53.98, 85.60]
  })

  const w = 53.98
  const h = 85.60
  const mx = 4

  // ============ FOND BLANC ============
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, w, h, 'F')

  // ============ EN-TÊTE VERT ============
  const headerH = 18
  pdf.setFillColor(0, 135, 81)
  pdf.rect(0, 0, w, headerH, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Renaissance Républicaine', mx, 7)

  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(144, 238, 144)
  pdf.text('Sunu Reew', mx, 12)

  // Logo haut droite
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 9, 9, 7, 'F')
    pdf.addImage(logoBase64, 'PNG', w - 16, 2, 14, 14)
  } catch (e) {
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 9, 9, 7, 'F')
    pdf.setFillColor(0, 135, 81)
    pdf.circle(w - 9, 10.5, 6.5, 'F')
    pdf.setFillColor(212, 175, 55)
    pdf.rect(w - 15.5, 9, 13, 6.5, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', w - 9, 11.5, { align: 'center' })
  }

  // ============ PHOTO ============
  const photoX = mx
  const photoY = headerH + 2.5
  const photoW = 16
  const photoH = 21

  if (member.photo) {
    try {
      const photoBase64 = await loadImageAsBase64(member.photo)
      pdf.addImage(photoBase64, 'PNG', photoX, photoY, photoW, photoH)
    } catch (e) {
      pdf.setFillColor(243, 244, 246)
      pdf.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'F')
    }
  } else {
    pdf.setFillColor(243, 244, 246)
    pdf.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'F')
  }

  pdf.setDrawColor(0, 135, 81)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'S')

  // ============ INFOS ============
  const infoX = mx + photoW + 2.5
  const infoW = w - infoX - mx
  let y = headerH + 4

  // NOM
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.8)
  pdf.setFont('helvetica', 'normal')
  pdf.text('NOM', infoX, y)

  y += 3.2
  pdf.setTextColor(17, 24, 39)
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'bold')
  const fullName = `${member.firstName} ${member.lastName}`.toUpperCase()
  const nameLines = pdf.splitTextToSize(fullName, infoW)
  pdf.text(nameLines, infoX, y)
  y += nameLines.length * 3 + 1.5

  // N° MEMBRE
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.8)
  pdf.setFont('helvetica', 'normal')
  pdf.text('N° MEMBRE', infoX, y)

  y += 3
  pdf.setTextColor(0, 135, 81)
  pdf.setFontSize(6.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipNumber || 'En attente', infoX, y)

  // TÉLÉPHONE
  y += 3.5
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.8)
  pdf.setFont('helvetica', 'normal')
  pdf.text('TÉLÉPHONE', infoX, y)

  y += 3
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.phone || 'N/A', infoX, y)

  // ============ SÉPARATRICE ============
  const sepY = photoY + photoH + 3
  pdf.setDrawColor(222, 226, 230)
  pdf.setLineWidth(0.2)
  pdf.line(mx, sepY, w - mx, sepY)

  // ============ DÉPARTEMENT | COMMUNE ============
  y = sepY + 3
  const midX = w / 2

  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.5)
  pdf.text('DÉPARTEMENT', mx, y)
  pdf.text('COMMUNE', midX + 1, y)

  y += 3
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(5.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.department?.name || member.cityAbroad || 'N/A', mx, y)
  pdf.text(member.commune?.name || member.country || 'N/A', midX + 1, y)

  // ============ PIED DE PAGE ============
  const footerY = h - 18
  pdf.setDrawColor(222, 226, 230)
  pdf.setLineWidth(0.2)
  pdf.line(mx, footerY, w - mx, footerY)

  // Logo bas
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.addImage(logoBase64, 'PNG', mx, footerY + 2, 9, 9)
  } catch (e) {
    pdf.setFillColor(0, 135, 81)
    pdf.circle(mx + 4.5, footerY + 6.5, 4.5, 'F')
    pdf.setFillColor(212, 175, 55)
    pdf.rect(mx, footerY + 6.5, 9, 4.5, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', mx + 4.5, footerY + 8, { align: 'center' })
  }

  // Membre depuis
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.8)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Membre depuis', mx + 12, footerY + 4)

  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', mx + 12, footerY + 8)

  // QR Code
  if (member.membershipNumber) {
    try {
      const qr = await QRCode.toDataURL(member.membershipNumber, {
        width: 180,
        margin: 1,
        color: { dark: '#008751', light: '#ffffff' }
      })
      pdf.addImage(qr, 'PNG', w - mx - 12, footerY + 1, 12, 12)
    } catch (e) {
      // QR optionnel
    }
  }

  pdf.save(`carte-membre-${member.membershipNumber}.pdf`)
}
