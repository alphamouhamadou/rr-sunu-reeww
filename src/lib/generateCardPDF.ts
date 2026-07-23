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

const calculateExpiryDate = (membershipDate: string): Date => {
  const date = new Date(membershipDate)
  date.setFullYear(date.getFullYear() + 5)
  return date
}

export async function generateCardPDF(member: CardMemberData) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 53.98]
  })

  const pageWidth = 85.6
  const pageHeight = 53.98

  // Header vert
  pdf.setFillColor(0, 135, 81)
  pdf.rect(0, 0, pageWidth, 18, 'F')

  // Dégradé simulé
  pdf.setFillColor(0, 107, 64)
  pdf.rect(60, 0, 25.6, 18, 'F')

  // Titre
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Renaissance Républicaine', 4, 7)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(187, 247, 208)
  pdf.text('Sunu Reew', 4, 12)

  // Logo en haut AVEC cercle blanc
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    pdf.setFillColor(255, 255, 255)
    pdf.circle(pageWidth - 12, 9, 9, 'F')
    pdf.addImage(logoBase64, 'PNG', pageWidth - 21, 0, 18, 18)
  } catch (e) {
    pdf.setFillColor(255, 255, 255)
    pdf.circle(pageWidth - 12, 9, 8, 'F')
    pdf.setTextColor(0, 135, 81)
    pdf.setFontSize(15)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RR', pageWidth - 12, 12, { align: 'center' })
  }

  // Corps blanc
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 18, pageWidth, pageHeight - 18, 'F')

  // Photo du membre
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

  // Bordure photo
  pdf.setDrawColor(0, 135, 81)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(4, 21, 18, 22, 2, 2, 'S')

  // Nom
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(5)
  pdf.text('NOM', 25, 24)
  pdf.setTextColor(17, 24, 39)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${member.firstName} ${member.lastName}`, 25, 28)

  // N° Membre
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('N° MEMBRE', 25, 33)
  pdf.setTextColor(0, 135, 81)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text(member.membershipNumber || 'En attente', 25, 37)

  // Téléphone
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('TÉLÉPHONE', 25, 41)
  pdf.setTextColor(55, 65, 81)
  pdf.setFontSize(7)
  pdf.text(member.phone || 'N/A', 25, 44)

  // Ligne séparatrice
  pdf.line(4, 46, pageWidth - 4, 46)

  // Labels bas
  pdf.setTextColor(156, 163, 175)
  pdf.setFontSize(4.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('DÉPARTEMENT', 4, 49)
  pdf.text('COMMUNE', 26, 49)
  pdf.text('MEMBRE DEPUIS', 48, 49)
  pdf.text('EXPIRE LE', 70, 49)

  // Valeurs bas
  pdf.setTextColor(31, 41, 55)
  pdf.setFontSize(5.5)
  pdf.text(member.department?.name || member.cityAbroad || 'N/A', 4, 52)
  pdf.text(member.commune?.name || member.country || 'N/A', 26, 52)
  pdf.text(member.membershipDate ? formatDate(member.membershipDate) : 'En attente', 48, 52)

  if (member.membershipDate) {
    const expiryDate = calculateExpiryDate(member.membershipDate)
    pdf.text(expiryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 70, 52)
  } else {
    pdf.text('En attente', 70, 52)
  }

  pdf.save(`carte-membre-${member.membershipNumber}.pdf`)
}