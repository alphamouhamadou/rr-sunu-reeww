'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Mail, Clock, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function VerificationEchecPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const { setCurrentSection } = useAppStore()

  const getErrorContent = () => {
    switch (reason) {
      case 'expired':
        return { icon: <Clock className="w-10 h-10 text-[#FFD100]" />, title: 'Lien expiré', message: 'Ce lien a expiré (validité: 24h).' }
      case 'invalid':
        return { icon: <AlertTriangle className="w-10 h-10 text-[#CE1126]" />, title: 'Lien invalide', message: 'Ce lien de vérification n\'est pas valide.' }
      case 'no_token':
        return { icon: <Mail className="w-10 h-10 text-gray-500" />, title: 'Token manquant', message: 'Aucun token fourni.' }
      default:
        return { icon: <XCircle className="w-10 h-10 text-[#CE1126]" />, title: 'Erreur', message: 'Une erreur est survenue.' }
    }
  }

  const errorContent = getErrorContent()

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
      <Card className="max-w-md w-full border-2 border-[#CE1126]/20">
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#CE1126]/10 flex items-center justify-center mx-auto mb-6">
            {errorContent.icon}
          </div>
          <h1 className="text-2xl font-bold text-[#CE1126] mb-3">{errorContent.title}</h1>
          <p className="text-gray-600 mb-6">{errorContent.message}</p>
          <Button className="w-full bg-[#008751] hover:bg-[#006b40]" onClick={() => setCurrentSection('login')}>
            Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}