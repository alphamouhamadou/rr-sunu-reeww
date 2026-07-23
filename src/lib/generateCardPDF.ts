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
  // Format portrait rectangle
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [63.5, 88]  // plus large pour que le nom tienne
  })

  const w = 63.5
  const h = 88
  const mx = 5

  // ============ FOND BLANC COMPLET ============
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, w, h, 'F')

  // ============ EN-TÊTE VERT ============
  const headerH = 20
  pdf.setFillColor(0, 135, 81)
  pdf.rect(0, 0, w, headerH, 'F')

  // Titre
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Renaissance Républicaine', mx, 8)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(144, 238, 144)
  pdf.text('Sunu Reew', mx, 13)

  // Logo cercle en haut à droite
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 10, 10, 8, 'F')
    pdf.addImage(logoBase64, 'PNG', w - 18, 2, 16, 16)
  } catch (e) {
    // Fallback logo RR
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 10, 10, 8, 'F')
    pdf.setFillColor(0, 135, 81)
    pdf.circle(w - 10, 11.5, 7.5, 'F')
    pdf.setFillColor(212, 175, 55)
    pdf.rect(w - 17.5, 10, 15, 7.5, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', w - 10, 12.5, { align: 'center' })
  }

  // ============ PHOTO ============
  const photoX = mx
  const photoY = headerH + 3
  const photoW = 18
  const photoH = 24

  if (member.photo) {
    try {
      const photoBase64 = await loadImageAsBase64(member.photo)
      pdf.addImage(photoBase64, 'PNG', photoX, photoY, photoW, photoH)
    } catch (e) {
      pdf.setFillColor(243, 244, 246)
      pdf.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'F')
    }
  } else {
    pdf.setFillColor(243, 244, 246)
    pdf.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'F')
  }

  // Bordure photo
  pdf.setDrawColor(0, 135, 81)
  pdf.setLineWidth(0.4)
  pdf.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'S')

  // ============ INFOS ============
  const infoX = mx + photoW + 3
  const infoW = w - infoX - mx
  let y = headerH + 5

  // NOM label
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('NOM', infoX, y)

  // NOM valeur - avec retour à la ligne automatique
  y += 4
  pdf.setTextColor(17, 24, 39)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  const fullName = `${member.firstName} ${member.lastName}`.toUpperCase()
  const nameLines = pdf.splitTextToSize(fullName, infoW)
  pdf.text(nameLines, infoX, y)
  y += nameLines.length * 3.5

  // N° MEMBRE
  y += 2
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('N° MEMBRE', infoX, y)

  y += 3.5
  pdf.setTextColor(0, 135, 81)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipNumber || 'En attente', infoX, y)

  // TÉLÉPHONE
  y += 4.5
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('TÉLÉPHONE', infoX, y)

  y += 3.5
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.phone || 'N/A', infoX, y)

  // ============ LIGNE SÉPARATRICE ============
  const sepY = headerH + photoH + 5
  pdf.setDrawColor(222, 226, 230)
  pdf.setLineWidth(0.3)
  pdf.line(mx, sepY, w - mx, sepY)

  // ============ DÉPARTEMENT | COMMUNE ============
  y = sepY + 4
  const midX = w / 2

  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4)
  pdf.setFont('helvetica', 'normal')
  pdf.text('DÉPARTEMENT', mx, y)
  pdf.text('COMMUNE', midX + 2, y)

  y += 4
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.department?.name || member.cityAbroad || 'N/A', mx, y)
  pdf.text(member.commune?.name || member.country || 'N/A', midX + 2, y)

  // ============ PIED DE PAGE ============
  const footerY = h - 20
  pdf.setDrawColor(222, 226, 230)
  pdf.setLineWidth(0.3)
  pdf.line(mx, footerY, w - mx, footerY)

  // Logo bas (plus visible)
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.addImage(logoBase64, 'PNG', mx, footerY + 2, 10, 10)
  } catch (e) {
    // Logo RR fallback - cercle plus grand et plus visible
    pdf.setFillColor(0, 135, 81)
    pdf.circle(mx + 5, footerY + 7, 5, 'F')
    pdf.setFillColor(212, 175, 55)
    pdf.rect(mx, footerY + 7, 10, 5, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', mx + 5, footerY + 8.5, { align: 'center' })
  }

  // Membre depuis
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Membre depuis', mx + 13, footerY + 4)

  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', mx + 13, footerY + 9)

  // QR Code
  if (member.membershipNumber) {
    try {
      const qr = await QRCode.toDataURL(member.membershipNumber, {
        width: 200,
        margin: 1,
        color: { dark: '#008751', light: '#ffffff' }
      })
      pdf.addImage(qr, 'PNG', w - mx - 14, footerY + 1, 14, 14)
    } catch (e) {
      // QR optionnel
    }
  }

  pdf.save(`carte-membre-${member.membershipNumber}.pdf`)
}
