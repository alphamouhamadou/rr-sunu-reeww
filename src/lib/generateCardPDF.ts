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
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 53.98]
  })

  const w = 85.6
  const h = 53.98

  // ============ HEADER VERT ============
  pdf.setFillColor(0, 135, 81)
  pdf.rect(0, 0, w, 18, 'F')
  // Dégradé
  pdf.setFillColor(0, 107, 64)
  pdf.rect(60, 0, 25.6, 18, 'F')

  // Titre
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Renaissance Républicaine', 4, 7)

  // Sous-titre
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(144, 238, 144)
  pdf.text('Sunu Reew', 4, 12)

  // Logo haut droite
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 12, 9, 9, 'F')
    pdf.addImage(logoBase64, 'PNG', w - 21, 0, 18, 18)
  } catch (e) {
    pdf.setFillColor(255, 255, 255)
    pdf.circle(w - 12, 9, 8, 'F')
    pdf.setFillColor(0, 135, 81)
    pdf.circle(w - 12, 10.5, 7.5, 'F')
    pdf.setFillColor(212, 175, 55)
    pdf.rect(w - 19.5, 9, 15, 7.5, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(15)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', w - 12, 12, { align: 'center' })
  }

  // ============ CORPS BLANC ============
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 18, w, h - 18, 'F')

  // ============ PHOTO ============
  if (member.photo) {
    try {
      const photoBase64 = await loadImageAsBase64(member.photo)
      pdf.addImage(photoBase64, 'PNG', 4, 21, 18, 22)
    } catch (e) {
      pdf.setFillColor(243, 244, 246)
      pdf.roundedRect(4, 21, 18, 22, 2, 2, 'F')
    }
  } else {
    pdf.setFillColor(243, 244, 246)
    pdf.roundedRect(4, 21, 18, 22, 2, 2, 'F')
  }
  pdf.setDrawColor(0, 135, 81)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(4, 21, 18, 22, 2, 2, 'S')

  // ============ INFOS ============
  // NOM label
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(5)
  pdf.text('NOM', 25, 24)

  // NOM valeur
  pdf.setTextColor(17, 24, 39)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${member.firstName} ${member.lastName}`, 25, 28)

  // N° MEMBRE label
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('N° MEMBRE', 25, 33)

  // N° MEMBRE valeur
  pdf.setTextColor(0, 135, 81)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipNumber || 'En attente', 25, 37)

  // TÉLÉPHONE label
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('TÉLÉPHONE', 25, 41)

  // TÉLÉPHONE valeur
  pdf.setTextColor(55, 65, 81)
  pdf.setFontSize(7)
  pdf.text(member.phone || 'N/A', 25, 44)

  // ============ LIGNE SÉPARATRICE ============
  pdf.line(4, 46, w - 4, 46)

  // ============ DÉPARTEMENT | COMMUNE | DEPUIS | EXPIRE ============
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('DÉPARTEMENT', 4, 49)
  pdf.text('COMMUNE', 26, 49)
  pdf.text('MEMBRE DEPUIS', 48, 49)
  pdf.text('EXPIRE LE', 70, 49)

  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(5.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.department?.name || member.cityAbroad || 'N/A', 4, 52)
  pdf.text(member.commune?.name || member.country || 'N/A', 26, 52)
  pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', 48, 52)

  // Expiration (5 ans)
  if (member.membershipDate) {
    const expiry = new Date(member.membershipDate)
    expiry.setFullYear(expiry.getFullYear() + 5)
    pdf.text(expiry.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 70, 52)
  } else {
    pdf.text('En attente', 70, 52)
  }

  // ============ QR CODE ============
  if (member.membershipNumber) {
    try {
      const qr = await QRCode.toDataURL(member.membershipNumber, {
        width: 200,
        margin: 2,
        color: { dark: '#008751', light: '#ffffff' }
      })
      pdf.addImage(qr, 'PNG', w - 18, 33, 12, 12)
    } catch (e) {
      // QR optionnel
    }
  }

  pdf.save(`carte-membre-${member.membershipNumber}.pdf`)
}
