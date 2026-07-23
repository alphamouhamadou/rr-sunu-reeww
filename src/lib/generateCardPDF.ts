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
    format: [85.60, 53.98]
  })

  const w = 85.60
  const h = 53.98
  const mx = 4

  // ============ FOND BLANC ============
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, w, h, 'F')

  // ============ BANDE VERT GAUCHE (header vertical) ============
  const bandW = 22
  pdf.setFillColor(0, 135, 81)
  pdf.rect(0, 0, bandW, h, 'F')

  // Dégradé
  pdf.setFillColor(0, 107, 64)
  pdf.rect(0, h / 2, bandW, h / 2, 'F')

  // Titre dans la bande
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Renaissance', bandW / 2, 10, { align: 'center' })
  pdf.text('Républicaine', bandW / 2, 15, { align: 'center' })

  pdf.setFontSize(5.5)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(144, 238, 144)
  pdf.text('Sunu Reew', bandW / 2, 19, { align: 'center' })

  // Logo dans la bande
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.setFillColor(255, 255, 255)
    pdf.circle(bandW / 2, h - 10, 7, 'F')
    pdf.addImage(logoBase64, 'PNG', bandW / 2 - 7, h - 17, 14, 14)
  } catch (e) {
    pdf.setFillColor(255, 255, 255)
    pdf.circle(bandW / 2, h - 10, 7, 'F')
    pdf.setFillColor(0, 135, 81)
    pdf.circle(bandW / 2, h - 8.5, 6.5, 'F')
    pdf.setFillColor(212, 175, 55)
    pdf.rect(bandW / 2 - 6.5, h - 10, 13, 6.5, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', bandW / 2, h - 7.5, { align: 'center' })
  }

  // ============ ZONE BLANCHE ============
  const bodyX = bandW + 1

  // ============ PHOTO ============
  const photoX = bodyX + 2
  const photoY = 3
  const photoW = 16
  const photoH = 22

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

  // ============ INFOS (à droite de la photo) ============
  const infoX = photoX + photoW + 3
  const infoW = w - infoX - mx
  let y = 4

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
  const nameLines = pdf.splitTextToSize(fullName, infoW)
  pdf.text(nameLines, infoX, y)
  y += nameLines.length * 3.2 + 2

  // N° MEMBRE
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4)
  pdf.setFont('helvetica', 'normal')
  pdf.text('N° MEMBRE', infoX, y)

  y += 3
  pdf.setTextColor(0, 135, 81)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipNumber || 'En attente', infoX, y)

  // TÉLÉPHONE
  y += 3.5
  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(4)
  pdf.setFont('helvetica', 'normal')
  pdf.text('TÉLÉPHONE', infoX, y)

  y += 3
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(6.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.phone || 'N/A', infoX, y)

  // ============ SÉPARATRICE ============
  const sepY = photoY + photoH + 3
  pdf.setDrawColor(222, 226, 230)
  pdf.setLineWidth(0.2)
  pdf.line(bodyX + 2, sepY, w - mx, sepY)

  // ============ DÉPARTEMENT | COMMUNE | MEMBRE DEPUIS ============
  y = sepY + 3
  const col1 = bodyX + 2
  const col2 = bodyX + 23
  const col3 = bodyX + 42

  pdf.setTextColor(108, 117, 125)
  pdf.setFontSize(3.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('DÉPARTEMENT', col1, y)
  pdf.text('COMMUNE', col2, y)
  pdf.text('MEMBRE DEPUIS', col3, y)

  y += 3.5
  pdf.setTextColor(33, 37, 41)
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.department?.name || member.cityAbroad || 'N/A', col1, y)
  pdf.text(member.commune?.name || member.country || 'N/A', col2, y)
  pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', col3, y)

  // ============ QR CODE (bas droite) ============
  if (member.membershipNumber) {
    try {
      const qr = await QRCode.toDataURL(member.membershipNumber, {
        width: 180,
        margin: 1,
        color: { dark: '#008751', light: '#ffffff' }
      })
      pdf.addImage(qr, 'PNG', w - mx - 13, h - 15, 13, 13)
    } catch (e) {
      // QR optionnel
    }
  }

  pdf.save(`carte-membre-${member.membershipNumber}.pdf`)
}
