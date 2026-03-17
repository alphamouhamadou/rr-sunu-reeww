'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Heart, ArrowLeft, Loader2, CheckCircle, Smartphone, CreditCard, ExternalLink } from 'lucide-react'

const donationAmounts = [5000, 10000, 25000, 50000, 100000, 250000]

export function DonationSection() {
  const { setCurrentSection, member } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [donorInfo, setDonorInfo] = useState({
    name: member ? `${member.firstName} ${member.lastName}` : '',
    email: member?.email || '',
    phone: member?.phone || '',
    message: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDonorInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getAmount = () => {
    if (customAmount) return parseInt(customAmount)
    return selectedAmount || 0
  }

  const handleSubmit = async () => {
    setError('')
    const amount = getAmount()

    if (!amount || amount < 100) {
      setError('Le montant minimum est de 100 FCFA')
      return
    }

    if (!donorInfo.name || !donorInfo.email || !donorInfo.phone) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)

    try {
      // Initiate PayTech payment
      const res = await fetch('/api/paytech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type: 'donation',
          itemName: `Don - Renaissance Républicaine Sunu Reew`,
          customerEmail: donorInfo.email,
          customerPhone: donorInfo.phone,
          memberId: member?.id || null,
        })
      })

      const data = await res.json()

      if (data.redirectUrl) {
        setPaymentUrl(data.redirectUrl)
        setSuccess(true)
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA'
  }

  if (success && paymentUrl) {
    return (
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#008751]" />
            </div>
            <h2 className="text-2xl font-bold text-[#008751] mb-4">Redirection vers PayTech</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous allez être redirigé vers la page de paiement sécurisée PayTech pour finaliser votre don.
            </p>
            <div className="bg-[#FFD100]/10 rounded-lg p-4 mb-6">
              <p className="text-lg font-semibold text-[#008751]">
                Montant: {formatAmount(getAmount())}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full bg-[#008751] hover:bg-[#006b40]"
                onClick={() => window.open(paymentUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir la page de paiement
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setCurrentSection('home')}
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="party-gradient text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-[#FFD100]" />
          <h1 className="text-4xl font-bold mb-4">Soutenez notre action</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Votre contribution nous permet de mener nos actions sur le terrain 
            et de travailler pour un Sénégal meilleur.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setCurrentSection('home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#008751]">Faire un Don</CardTitle>
              <CardDescription>
                Soutenez financièrement Renaissance Républicaine Sunu Reew
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="bg-[#CE1126]/10 border-[#CE1126]">
                  <AlertDescription className="text-[#CE1126]">{error}</AlertDescription>
                </Alert>
              )}

              {/* Amount Selection */}
              <div>
                <Label className="text-base font-semibold">Choisissez un montant</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {donationAmounts.map(amount => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? 'default' : 'outline'}
                      className={`h-14 ${selectedAmount === amount ? 'bg-[#008751] hover:bg-[#006b40]' : ''}`}
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount('')
                      }}
                    >
                      {formatAmount(amount)}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Label>Ou entrez un montant personnalisé</Label>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    placeholder="Montant en FCFA"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-[#008751]/5 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-[#008751]" />
                  <span className="font-semibold text-[#008751]">Paiement sécurisé via PayTech</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    Wave
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    Orange Money
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Carte bancaire
                  </div>
                </div>
              </div>

              {/* Donor Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={donorInfo.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={donorInfo.email}
                      onChange={handleInputChange}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={donorInfo.phone}
                      onChange={handleInputChange}
                      placeholder="+221 77 XXX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Input
                    id="message"
                    name="message"
                    value={donorInfo.message}
                    onChange={handleInputChange}
                    placeholder="Un mot d'encouragement..."
                  />
                </div>
              </div>

              {/* Summary */}
              {getAmount() > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Montant total</span>
                    <span className="text-2xl font-bold text-[#008751]">
                      {formatAmount(getAmount())}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-[#008751] hover:bg-[#006b40] h-12"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Faire un don de {formatAmount(getAmount())}
                  </>
                )}
              </Button>

              <Alert className="bg-[#FFD100]/10 border-[#FFD100]">
                <AlertDescription className="text-sm text-center">
                  Paiement sécurisé via PayTech. Vous serez redirigé vers une page sécurisée 
                  pour finaliser votre don avec Wave, Orange Money ou carte bancaire.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
