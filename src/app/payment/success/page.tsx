'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState('Vérification du paiement...')

  useEffect(() => {
    const ref = searchParams.get('ref') || ''
    const pending = searchParams.get('pending') === 'true'

    // Store payment ref for the app to pick up
    if (ref) {
      sessionStorage.setItem('lastPaymentRef', ref)
    }

    if (pending) {
      setMessage('Paiement en cours de validation. Vous recevrez une confirmation sous peu.')
    } else {
      setMessage('Paiement effectué avec succès !')
    }

    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-[#008751] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#008751]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Paiement réussi
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Retour à l&apos;accueil...</span>
        </div>
      </div>
    </div>
  )
}