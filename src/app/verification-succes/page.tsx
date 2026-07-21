'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function VerificationSuccessPage() {
  const { setCurrentSection } = useAppStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSection('login')
    }, 5000)
    return () => clearTimeout(timer)
  }, [setCurrentSection])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <Card className="max-w-md w-full border-2 border-[#008751]/20">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#008751] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#008751] mb-3">Email vérifié !</h1>
          <p className="text-gray-600 mb-4">Votre adresse email a été vérifiée avec succès.</p>
          <p className="text-gray-500 mb-6">Votre compte est en attente de validation par un administrateur.</p>
          <div className="bg-[#008751]/10 rounded-lg p-4">
            <p className="text-[#008751] text-sm">Redirection vers la connexion...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}