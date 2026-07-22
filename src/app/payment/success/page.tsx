'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Download, Mail, CreditCard, ArrowLeft } from 'lucide-react'

interface MemberInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  membershipNumber: string | null
  membershipDate: string | null
  hasPaidCard: boolean
  department?: { name: string } | null
  commune?: { name: string } | null
  country?: string | null
  cityAbroad?: string | null
  photo?: string | null
}

function generateCardPDF(cardInfo: MemberInfo) {
  import('jspdf').then(({ default: jsPDF }) => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] })

    pdf.setFillColor(0, 135, 81)
    pdf.rect(0, 0, 85.6, 53.98, 'F')

    pdf.setFillColor(255, 209, 0)
    pdf.rect(0, 0, 85.6, 4, 'F')
    pdf.rect(0, 49.98, 85.6, 4, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(6)
    pdf.text('RENAISSANCE REPUBLICAINE', 42.8, 8, { align: 'center' })
    pdf.setFontSize(7)
    pdf.text('SUNU REEW', 42.8, 12, { align: 'center' })

    pdf.setFontSize(9)
    pdf.text(`${cardInfo.firstName} ${cardInfo.lastName}`, 5, 22)
    pdf.setFontSize(5.5)
    pdf.text(`N\u00b0 Membre: ${cardInfo.membershipNumber || 'En attente'}`, 5, 27)
    pdf.text(`Tel: ${cardInfo.phone}`, 5, 31.5)
    const location = cardInfo.department?.name || cardInfo.cityAbroad || ''
    const subLocation = cardInfo.commune?.name || cardInfo.country || ''
    pdf.text(location, 5, 36)
    pdf.text(subLocation, 5, 40)
    pdf.text(
      cardInfo.membershipDate
        ? `Adhesion: ${new Date(cardInfo.membershipDate).toLocaleDateString('fr-FR')}`
        : 'En attente de validation',
      5, 44
    )

    pdf.save(`carte-membre-${cardInfo.membershipNumber || 'RR'}.pdf`)
  })
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'card_ready' | 'card_not_found'>('loading')
  const [email, setEmail] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)

  const lookupMember = useCallback(async (lookupEmail: string) => {
    if (!lookupEmail) return
    setLookupLoading(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const res = await fetch(`/api/card?email=${encodeURIComponent(lookupEmail)}`)
      const data = await res.json()
      if (data.member && data.member.hasPaidCard) {
        setMemberInfo(data.member)
        setStatus('card_ready')
      } else if (data.member) {
        setMemberInfo(data.member)
        setStatus('card_not_found')
      } else {
        setStatus('card_not_found')
      }
    } catch {
      setStatus('card_not_found')
    } finally {
      setLookupLoading(false)
    }
  }, [])

  useEffect(() => {
    const type = searchParams.get('type') || ''
    const pending = searchParams.get('pending') === 'true'

    const ref = searchParams.get('ref') || ''
    if (ref) {
      sessionStorage.setItem('lastPaymentRef', ref)
    }

    if (type.includes('card') || ref.includes('CARD')) {
      const storedMemberId = sessionStorage.getItem('pendingCardMemberId')
      const storedEmail = sessionStorage.getItem('pendingCardEmail')

      if (storedMemberId) {
        const pollCard = async () => {
          for (let i = 0; i < 6; i++) {
            await new Promise(r => setTimeout(r, 2000))
            try {
              const res = await fetch(`/api/card?memberId=${storedMemberId}`)
              const data = await res.json()
              if (data.member?.hasPaidCard) {
                setMemberInfo(data.member)
                setStatus('card_ready')
                sessionStorage.removeItem('pendingCardMemberId')
                sessionStorage.removeItem('pendingCardEmail')
                return
              }
            } catch { /* continue polling */ }
          }
          setStatus('card_not_found')
          if (storedEmail) setEmail(storedEmail)
        }
        pollCard()
      } else if (storedEmail) {
        setEmail(storedEmail)
        setStatus('card_not_found')
        sessionStorage.removeItem('pendingCardEmail')
      } else {
        setStatus(pending ? 'loading' : 'success')
      }
    } else {
      setStatus(pending ? 'loading' : 'success')
    }
  }, [searchParams])

  const handleDownload = () => {
    if (memberInfo) generateCardPDF(memberInfo)
  }

  return (
    <div className="min-h-screen bg-[#008751] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-[#008751] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Paiement en cours de validation...
            </h1>
            <p className="text-gray-600">
              Veuillez patienter, nous vérifions votre paiement.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#008751]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 mb-6">
              Merci pour votre contribution. Votre paiement a été traité avec succès.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#008751] text-white rounded-lg hover:bg-[#006b40] transition min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </button>
          </>
        )}

        {status === 'card_ready' && memberInfo && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#008751]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 mb-6">
              Votre carte membre est prête. Téléchargez-la maintenant.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="font-semibold text-gray-900">{memberInfo.firstName} {memberInfo.lastName}</p>
              <p className="text-sm text-gray-500">N° {memberInfo.membershipNumber || 'En attente'}</p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#008751] text-white rounded-xl hover:bg-[#006b40] transition text-lg font-semibold min-h-[44px]"
            >
              <CreditCard className="w-5 h-5" />
              Télécharger ma carte membre
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/')}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </button>
          </>
        )}

        {status === 'card_not_found' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Paiement en cours de confirmation
            </h1>
            <p className="text-gray-600 mb-6">
              Entrez votre email pour vérifier et télécharger votre carte membre.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008751] focus:border-transparent min-h-[44px]"
                onKeyDown={(e) => e.key === 'Enter' && lookupMember(email)}
              />
              <button
                onClick={() => lookupMember(email)}
                disabled={lookupLoading || !email}
                className="px-4 py-3 bg-[#008751] text-white rounded-lg hover:bg-[#006b40] disabled:opacity-50 transition min-h-[44px]"
              >
                {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SearchIcon className="w-5 h-5" />}
              </button>
            </div>

            {memberInfo && memberInfo.hasPaidCard && (
              <button
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#008751] text-white rounded-xl hover:bg-[#006b40] transition text-lg font-semibold min-h-[44px]"
              >
                <CreditCard className="w-5 h-5" />
                Télécharger ma carte membre
                <Download className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => router.push('/')}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#008751] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}