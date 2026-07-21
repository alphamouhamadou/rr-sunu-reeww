'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KeyRound, ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const { setCurrentSection } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Utiliser /api/auth/reset-password au lieu de /api/auth/forgot-password
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setCurrentSection('login')
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#008751]" />
            </div>
            <h2 className="text-xl font-bold text-[#008751] mb-2">Email envoyé !</h2>
            <p className="text-gray-600 mb-4">
              Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.
            </p>
            <Alert className="bg-[#FFD100]/10 border-[#FFD100] text-left">
              <AlertDescription className="text-sm">
                Le lien expire dans 1 heure. Pensez à vérifier vos spams.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="mt-6" onClick={handleBackToLogin}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <Button variant="ghost" className="mb-6" onClick={handleBackToLogin}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full party-gradient flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#008751]">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
                <AlertDescription className="text-[#CE1126]">{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="pl-10 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#008751] hover:bg-[#006b40] h-11"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Envoyer le lien de réinitialisation
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Vous vous souvenez de votre mot de passe ?</p>
            <Button variant="link" className="text-[#008751]" onClick={handleBackToLogin}>
              Se connecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}