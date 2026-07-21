import jsPDF from 'jspdf'

interface ReceiptData {
  receiptNumber: string
  date: Date
  memberName: string
  membershipNumber: string
  amount: number
  paymentMethod: string
  paymentRef: string
  type: 'donation' | 'contribution' | 'card_fee'
  period?: string
}

const PARTY_NAME = 'Renaissance Républicaine Sunu Reew'
const PARTY_ADDRESS = 'Dakar, Sénégal'
const PARTY_EMAIL = 'contact@rrsunureew.sn'
const PARTY_PHONE = '+221 33 XXX XX XX'

export function generateReceiptPDF(data: ReceiptData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  // ============ EN-TÊTE ============
  
  // Bande verte en haut
  doc.setFillColor(0, 135, 81)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Bande jaune
  doc.setFillColor(255, 209, 0)
  doc.rect(0, 40, pageWidth, 5, 'F')
  
  // Bande rouge
  doc.setFillColor(206, 17, 38)
  doc.rect(0, 45, pageWidth, 3, 'F')

  // Titre du parti
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(PARTY_NAME, pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Sunu Reew', pageWidth / 2, 32, { align: 'center' })

  // ============ TITRE REÇU ============
  
  doc.setTextColor(0, 135, 81)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('REÇU DE PAIEMENT', pageWidth / 2, 65, { align: 'center' })
  
  
  // Ligne sous le titre
  doc.setDrawColor(255, 209, 0)
  doc.setLineWidth(1)
  doc.line(margin, 70, pageWidth - margin, 70)

  // ============ NUMÉRO ET DATE ============
  
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const formattedDate = data.date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  doc.text('N° Reçu: ' + data.receiptNumber, margin, 85)
  doc.text('Date: ' + formattedDate, pageWidth - margin, 85, { align: 'right' })

  // ============ CADRE D'INFORMATIONS ============
  
  // Cadre
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, 95, pageWidth - 2 * margin, 60, 3, 3, 'S')
  
  // Titre du cadre
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, 95, pageWidth - 2 * margin, 12, 'F')
  doc.setTextColor(0, 135, 81)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMATIONS DU MEMBRE', margin + 5, 103)
  
  // Contenu
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  let yPos = 118
  
  doc.setFont('helvetica', 'bold')
  doc.text('Nom complet:', margin + 5, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.memberName, margin + 45, yPos)
  
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.text('N° Membre:', margin + 5, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.membershipNumber, margin + 45, yPos)
  
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Référence paiement:', margin + 5, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.paymentRef, margin + 55, yPos)

  // ============ DÉTAIL DU PAIEMENT ============
  
  // Type de paiement
  let paymentLabel = ''
  switch (data.type) {
    case 'donation':
      paymentLabel = 'Don'
      break
    case 'contribution':
      paymentLabel = 'Cotisation - ' + (data.period || '')
      break
    case 'card_fee':
      paymentLabel = 'Frais de carte de membre'
      break
  }

  // Cadre montant
  doc.setDrawColor(0, 135, 81)
  doc.setLineWidth(1)
  doc.roundedRect(margin, 165, pageWidth - 2 * margin, 40, 3, 3, 'S')
  
  doc.setTextColor(0, 135, 81)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAIL DU PAIEMENT', margin + 5, 175)
  
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Type: ' + paymentLabel, margin + 5, 188)
  doc.text('Mode de paiement: ' + formatPaymentMethod(data.paymentMethod), margin + 5, 198)
  
  // Montant
  const amountStr = formatAmount(data.amount)
  doc.setTextColor(0, 135, 81)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(amountStr, pageWidth - margin - 5, 195, { align: 'right' })

  // ============ MENTIONS LÉGALES ============
  
  doc.setTextColor(120, 120, 120)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  
  const legalText = 'Ce reçu atteste du paiement effectué auprès de Renaissance Républicaine Sunu Reew. ' +
    'Il peut être utilisé comme justificatif de paiement. En cas de réclamation, veuillez contacter ' +
    'le secrétariat du parti.'
  
  const splitText = doc.splitTextToSize(legalText, pageWidth - 2 * margin)
  doc.text(splitText, margin, 220)

  // ============ SIGNATURE ============
  
  // Ligne pour signature
  doc.setDrawColor(200, 200, 200)
  doc.line(pageWidth - margin - 60, 255, pageWidth - margin, 255)
  
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature du Trésorier', pageWidth - margin - 30, 262, { align: 'center' })

  // ============ PIED DE PAGE ============
  
  // Bande verte en bas
  doc.setFillColor(0, 135, 81)
  doc.rect(0, 280, pageWidth, 17, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text(PARTY_ADDRESS, pageWidth / 2, 286, { align: 'center' })
  doc.text('Email: ' + PARTY_EMAIL + ' | Tél: ' + PARTY_PHONE, pageWidth / 2, 292, { align: 'center' })

  // ============ FILIGRANE (WATERMARK) ============
  
  doc.setTextColor(240, 240, 240)
  doc.setFontSize(50)
  doc.setFont('helvetica', 'bold')
  doc.text('REÇU', pageWidth / 2, 150, { align: 'center', angle: 45 })

  // Retourner le PDF comme Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

export function generateReceiptNumber(type: string, id: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  const prefix = type === 'donation' ? 'DON' : 
                 type === 'contribution' ? 'COT' : 'CAR'
  
  return 'RR-' + prefix + '-' + year + month + '-' + random
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    'wave': 'Wave',
    'orange_money': 'Orange Money',
    'card': 'Carte bancaire',
    'cash': 'Espèces',
    'transfer': 'Virement bancaire',
    'paytech': 'PayTech'
  }
  return methods[method] || method
}

export function getReceiptFilename(data: ReceiptData): string {
  const sanitized = data.memberName.replace(/[^a-zA-Z0-9]/g, '_')
  const dateStr = data.date.toISOString().split('T')[0]
  return 'recu_' + sanitized + '_' + data.receiptNumber + '_' + dateStr + '.pdf'
}
