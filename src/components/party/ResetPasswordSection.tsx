'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function ResetPasswordSection() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setCurrentSection } = useAppStore()
  const token = searchParams.get('reset-password')

  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setValidating(false)
        return
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await res.json()

        if (data.valid) {
          setTokenValid(true)
          const email = data.email || ''
          const parts = email.split('@')
          if (parts.length === 2) {
            const localPart = parts[0]
            const domain = parts[1]
            const masked = localPart.substring(0, 2) + '***@' + domain
            setMaskedEmail(masked)
          }
        } else {
          setError(data.error || 'Token invalide ou expiré')
        }
      } catch (err) {
        setError('Erreur de vérification du lien')
      } finally {
        setValidating(false)
      }
    }

    verifyToken()
  }, [token])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: formData.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la réinitialisation')
        return
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/')
        setCurrentSection('login')
      }, 3000)
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/')
    setCurrentSection('login')
  }

  if (!token) {
    return null
  }

  if (validating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#008751]" />
            <p className="mt-4 text-gray-600">Vérification du lien...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#008751]" />
            </div>
            <h2 className="text-xl font-bold text-[#008751] mb-2">Mot de passe réinitialisé !</h2>
            <p className="text-gray-600 mb-4">
              Votre mot de passe a été modifié avec succès.
            </p>
            <Alert className="bg-[#008751]/10 border-[#008751]">
              <AlertDescription className="text-[#008751]">
                Vous allez être redirigé vers la page de connexion...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#CE1126]/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-[#CE1126]" />
            </div>
            <h2 className="text-xl font-bold text-[#CE1126] mb-2">Lien invalide</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Ce lien de réinitialisation est invalide ou a expiré.'}
            </p>
            <Button className="bg-[#008751] hover:bg-[#006b40]" onClick={handleBackToLogin}>
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full party-gradient flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#008751]">Réinitialisation</CardTitle>
          <CardDescription>
            Définissez un nouveau mot de passe pour <span className="font-medium">{maskedEmail}</span>
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
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min. 6 caractères"
                  className="min-h-[48px] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Retapez le mot de passe"
                  className="min-h-[48px] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#008751] hover:bg-[#006b40] h-11"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Réinitialisation...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Réinitialiser mon mot de passe
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}