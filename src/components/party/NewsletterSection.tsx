'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle2, Loader2, Bell, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setEmail('')
        setName('')
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Une erreur est survenue')
      }
    } catch {
      toast.error('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#008751] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD100] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#CE1126] rounded-full blur-3xl"></div>
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD100]/10 border border-[#FFD100]/20 rounded-full mb-6">
            <Bell className="w-4 h-4 text-[#FFD100]" />
            <span className="text-[#FFD100] text-sm font-medium">Restez informé</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Inscrivez-vous à notre <span className="text-[#FFD100]">Newsletter</span>
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Recevez les dernières actualités, événements et annonces de Renaissance Républicaine Sunu Reew directement dans votre boîte mail.
          </p>

          {/* Form or Success Message */}
          {isSuccess ? (
            <div className="bg-[#008751]/20 border border-[#008751]/30 rounded-2xl p-8 backdrop-blur-sm">
              <div className="w-16 h-16 bg-[#008751] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Inscription réussie !</h3>
              <p className="text-gray-300">
                Merci de rejoindre notre communauté. Vous recevrez bientôt nos actualités.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Inscrire une autre adresse
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                {/* Name input (optional) */}
                <Input
                  type="text"
                  placeholder="Votre nom (optionnel)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-white/10 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFD100] focus:ring-[#FFD100]/20 h-12 rounded-xl"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                {/* Email input */}
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 bg-white/10 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFD100] focus:ring-[#FFD100]/20 h-12 rounded-xl"
                    required
                  />
                </div>
                
                {/* Submit button */}
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#FFD100] text-black hover:bg-[#e6bc00] font-semibold h-12 px-8 rounded-xl shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      S'inscrire
                    </>
                  )}
                </Button>
              </div>

              {/* Privacy note */}
              <p className="text-gray-500 text-sm mt-4">
                🔒 Vos données sont protégées. Nous ne partageons jamais vos informations.
              </p>
            </form>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-700">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#008751]/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#4ade80]" />
              </div>
              <span className="text-gray-300 text-sm">Actualités exclusives</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD100]/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#FFD100]" />
              </div>
              <span className="text-gray-300 text-sm">Événements en avant-première</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CE1126]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#f87171]" />
              </div>
              <span className="text-gray-300 text-sm">Contenus spéciaux</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
