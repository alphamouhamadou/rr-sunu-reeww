import jsPDF from 'jspdf'

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
  // Format VERTICAL (portrait) - comme sur l'image
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [54, 86]
  })

  const w = 54
  const h = 86
  const mx = 4 // margin x

  // ============ EN-TÊTE VERT (top 25%) ============
  const headerH = 22
  pdf.setFillColor(0, 135, 81)
  pdf.rect(0, 0, w, headerH, 'F')

  // Titre
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Renaissance', mx, 8)
  pdf.text('Républicaine', mx, 14)

  // Sous-titre
  pdf.setFontSize(6.5)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(144, 238, 144)
  pdf.text('Sunu Reew', mx, 19)

  // Logo cercle en haut à droite
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    // Cercle blanc
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 8, 11, 7, 'F')
    pdf.addImage(logoBase64, 'PNG', w - 15, 4, 14, 14)
  } catch (e) {
    // Fallback : cercle vert/jaune
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 8, 11, 7, 'F')
    // Moitié supérieure verte
    pdf.setFillColor(0, 135, 81)
    pdf.circle(w - 8, 12, 6.5, 'F')
    // Moitié inférieure jaune
    pdf.setFillColor(212, 175, 55)
    pdf.rect(w - 14.5, 11, 13, 6, 'F')
    // Lettres RR
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', w - 8, 13, { align: 'center' })
  }

  // ============ CORPS BLANC ============
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, headerH, w, h - headerH, 'F')

  // Photo (colonne gauche)
  const photoX = mx
  const photoY = headerH + 3
  const photoW = 17
  const photoH = 22

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

  // Bordure photo verte
  pdf.setDrawColor(0, 135, 81)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'S')

  // ============ INFOS (colonne droite) ============
  const infoX = mx + photoW + 3
  let y = headerH + 5

  // NOM
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4)
  pdf.setFont('helvetica', 'normal')
  pdf.text('NOM', infoX, y)

  y += 3.5
  pdf.setTextColor(17, 24, 39)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  const fullName = `${member.firstName} ${member.lastName}`.toUpperCase()
  pdf.text(fullName, infoX, y)

  // N° MEMBRE
  y += 5
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4)
  pdf.setFont('helvetica', 'normal')
  pdf.text('N° MEMBRE', infoX, y)

  y += 3.5
  pdf.setTextColor(0, 135, 81)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipNumber || 'En attente', infoX, y)

  // TÉLÉPHONE
  y += 5
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4)
  pdf.setFont('helvetica', 'normal')
  pdf.text('TÉLÉPHONE', infoX, y)

  y += 3.5
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(6.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.phone || 'N/A', infoX, y)

  // ============ LIGNE SÉPARATRICE ============
  const sepY = headerH + photoH + 5
  pdf.setDrawColor(222, 226, 230)
  pdf.setLineWidth(0.2)
  pdf.line(mx, sepY, w - mx, sepY)

  // ============ DÉPARTEMENT | COMMUNE ============
  y = sepY + 3.5
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('DÉPARTEMENT', mx, y)
  pdf.text('COMMUNE', w / 2 + 2, y)

  y += 3.5
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.department?.name || member.cityAbroad || 'N/A', mx, y)
  pdf.text(member.commune?.name || member.country || 'N/A', w / 2 + 2, y)

  // ============ PIED DE PAGE (date + QR) ============
  const footerY = h - 16
  pdf.setDrawColor(222, 226, 230)
  pdf.line(mx, footerY, w - mx, footerY)

  // Logo petit + Membre depuis
  pdf.setFillColor(0, 135, 81)
  pdf.circle(mx + 3, footerY + 5, 3, 'F')
  pdf.setFillColor(212, 175, 55)
  pdf.rect(mx, footerY + 5, 6, 3, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(3.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text('RR', mx + 3, footerY + 6, { align: 'center' })

  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Membre depuis', mx + 8, footerY + 3.5)

  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', mx + 8, footerY + 8)

  // QR Code
  if (member.membershipNumber) {
    try {
      const QRCode = (await import('qrcode')).default
      const qr = await QRCode.toDataURL(member.membershipNumber, {
        width: 150,
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
