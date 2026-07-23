'use client'

import { useState } from 'react'
import { generateCardPDF } from '@/lib/generateCardPDF'

interface CardLookupMember {
  id: string
  firstName: string
  lastName: string
  membershipNumber: string
  phone?: string
  email?: string
  photo?: string | null
  hasPaidCard: boolean
  membershipDate?: string
  department?: { name: string } | null
  commune?: { name: string } | null
  cityAbroad?: string | null
  country?: string | null
  region?: { name: string } | null
}

export default function CardLookupButton() {
  const [open, setOpen] = useState(false)
  const [cardInput, setCardInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState<CardLookupMember | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    const trimmed = cardInput.trim().toUpperCase()
    const email = emailInput.trim().toLowerCase()
    if (!trimmed || !email) return

    setLoading(true)
    setError('')
    setMember(null)

    try {
      const res = await fetch(`/api/card?cardNumber=${encodeURIComponent(trimmed)}&email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.member) {
        setMember(data.member)
      } else {
        setError('Numéro d\'adhésion ou email incorrect.')
      }
    } catch {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

    const handleDownload = async () => {
    if (!member) return
    await generateCardPDF({
      firstName: member.firstName,
      lastName: member.lastName,
      membershipNumber: member.membershipNumber,
      phone: member.phone,
      email: member.email,
      membershipDate: member.membershipDate,
      photo: member.photo,
      department: member.department,
      commune: member.commune,
      cityAbroad: member.cityAbroad,
      country: member.country,
    })
  }

  const handleClose = () => {
    setOpen(false)
    setCardInput('')
    setEmailInput('')
    setMember(null)
    setError('')
  }

  return (
    <>
      {/* Bouton flottant en haut à gauche */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-[#008751] hover:bg-[#006d42] text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 text-sm font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Ma Carte
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-[#008751] px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-lg font-bold">Ma Carte Membre</h2>
              <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {!member ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro d'adhésion
                  </label>
                  <input
                    type="text"
                    value={cardInput}
                    onChange={(e) => { setCardInput(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: SN-RR-000005"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none placeholder:text-gray-400 uppercase mb-3"
                    autoFocus
                  />

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: prenom.nom@email.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none placeholder:text-gray-400 mb-3"
                  />

                  <button
                    onClick={handleSearch}
                    disabled={loading || !cardInput.trim() || !emailInput.trim()}
                    className="w-full bg-[#008751] hover:bg-[#006d42] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Recherche...
                      </span>
                    ) : 'Rechercher ma carte'}
                  </button>

                  {error && (
                    <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}
                </div>
              ) : (
                <div>
                  {/* Aperçu visuel carte */}
                  <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 shadow-lg">
                    <div className="absolute inset-0 bg-[#008751]" />
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#D4AF37]" />
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#D4AF37]" />
                    <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-xl">RR</p>
                          <p className="text-white/70 text-[10px]">SUNU REEWW</p>
                        </div>
                        <p className="text-white text-[10px] font-semibold">CARTE DE MEMBRE</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-sm">{member.firstName} {member.lastName}</p>
                        <p className="text-white/90 text-xs mt-1">N° {member.membershipNumber}</p>
                      </div>
                      <div className="text-center">
                        {member.phone && <p className="text-white/70 text-[9px]">{member.phone}</p>}
                        {member.email && <p className="text-white/70 text-[8px]">{member.email}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMember(null); setCardInput(''); setEmailInput(''); setError('') }}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Nouvelle recherche
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-[#D4AF37] hover:bg-[#c9a02e] text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Télécharger
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
