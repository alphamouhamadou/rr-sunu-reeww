'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LogIn, ArrowLeft, Loader2, UserPlus, KeyRound, Mail, 
  CheckCircle, Eye, EyeOff, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

type View = 'login' | 'forgot-password' | 'reset-password'

export function LoginForm() {
  const { setCurrentSection, setMember } = useAppStore()
  const [view, setView] = useState<View>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [resetData, setResetData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Check for reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const resetToken = params.get('reset-password')
    if (resetToken) {
      setResetData(prev => ({ ...prev, token: resetToken }))
      setView('reset-password')
      // Clear URL
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (view === 'login') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setResetData(prev => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  // Login submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      setMember(data.member)
      setCurrentSection('member')
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Request password reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
      } else {
        setSuccess(data.message)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Reset password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (resetData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: resetData.token, 
          newPassword: resetData.newPassword 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue')
      } else {
        setSuccess('Mot de passe réinitialisé avec succès !')
        setTimeout(() => {
          setView('login')
          setResetData({ email: '', token: '', newPassword: '', confirmPassword: '' })
          setSuccess('')
        }, 2000)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Verify reset token
  useEffect(() => {
    if (view === 'reset-password' && resetData.token) {
      fetch(`/api/auth/reset-password?token=${resetData.token}`)
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            setError(data.error || 'Lien invalide ou expiré')
          } else {
            setResetData(prev => ({ ...prev, email: data.email }))
          }
        })
        .catch(err => {
          console.error(err)
          setError('Erreur de vérification du lien')
        })
    }
  }, [view, resetData.token])

  const renderBackButton = () => (
    <Button 
      variant="ghost" 
      className="mb-6 min-h-[44px] touch-manipulation"
      onClick={() => {
        if (view !== 'login') {
          setView('login')
          setError('')
          setSuccess('')
        } else {
          setCurrentSection('home')
        }
      }}
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      {view !== 'login' ? 'Retour à la connexion' : 'Retour'}
    </Button>
  )

  // Login View
  if (view === 'login') {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in mobile-bottom-padding">
        {renderBackButton()}

        <Card className="max-w-md mx-auto mobile-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full party-gradient flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-[#008751]">Espace Membre</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte RR Sunu Reew
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
                  <AlertDescription className="text-[#CE1126] text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className="pl-10 min-h-[48px] text-base"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Votre mot de passe"
                    className="pl-10 pr-10 min-h-[48px] text-base"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot-password')
                    setError('')
                    setSuccess('')
                  }}
                  className="text-sm text-[#008751] hover:underline touch-manipulation min-h-[44px] px-2"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#008751] hover:bg-[#006b40] min-h-[48px] text-base touch-manipulation"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4 text-sm">Pas encore membre ?</p>
              <Button
                variant="outline"
                className="w-full min-h-[48px] touch-manipulation"
                onClick={() => setCurrentSection('join')}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Adhérer au parti
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Forgot Password View
  if (view === 'forgot-password') {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in mobile-bottom-padding">
        {renderBackButton()}

        <Card className="max-w-md mx-auto mobile-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFD100]/20 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-[#008751]" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-[#008751]">Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#008751]" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{success}</p>
                <Alert className="bg-[#FFD100]/10 border-[#FFD100]">
                  <AlertDescription className="text-sm">
                    Vérifiez votre boîte de réception et vos spams.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {error && (
                  <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
                    <AlertDescription className="text-[#CE1126] text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      value={resetData.email}
                      onChange={handleInputChange}
                      placeholder="votre@email.com"
                      className="pl-10 min-h-[48px] text-base"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#008751] hover:bg-[#006b40] min-h-[48px] text-base touch-manipulation"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Envoyer le lien
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Reset Password View
  if (view === 'reset-password') {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in mobile-bottom-padding">
        {renderBackButton()}

        <Card className="max-w-md mx-auto mobile-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#008751]" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-[#008751]">Nouveau mot de passe</CardTitle>
            <CardDescription>
              {resetData.email ? `Pour ${resetData.email}` : 'Créez votre nouveau mot de passe'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#008751]" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
                    <AlertDescription className="text-[#CE1126] text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium">Nouveau mot de passe</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={resetData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Min. 6 caractères"
                      className="pl-10 pr-10 min-h-[48px] text-base"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={resetData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Retapez le mot de passe"
                      className="pl-10 min-h-[48px] text-base"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#008751] hover:bg-[#006b40] min-h-[48px] text-base touch-manipulation"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-2" />
                      Réinitialiser le mot de passe
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
