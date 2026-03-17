'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, User, MapPin, Phone, Mail, FileText, ArrowLeft, Loader2, Globe, Camera, Upload, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Region {
  id: string
  name: string
  departments: Department[]
}

interface Department {
  id: string
  name: string
  communes: Commune[]
}

interface Commune {
  id: string
  name: string
}

// Liste des pays de la diaspora sénégalaise avec indicatifs téléphoniques
const diasporaCountries = [
  { code: 'SN', name: 'Sénégal', phoneCode: '+221' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
  { code: 'US', name: 'États-Unis', phoneCode: '+1' },
  { code: 'IT', name: 'Italie', phoneCode: '+39' },
  { code: 'ES', name: 'Espagne', phoneCode: '+34' },
  { code: 'DE', name: 'Allemagne', phoneCode: '+49' },
  { code: 'BE', name: 'Belgique', phoneCode: '+32' },
  { code: 'GB', name: 'Royaume-Uni', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', phoneCode: '+1' },
  { code: 'MA', name: 'Maroc', phoneCode: '+212' },
  { code: 'TN', name: 'Tunisie', phoneCode: '+216' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225' },
  { code: 'ML', name: 'Mali', phoneCode: '+223' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226' },
  { code: 'GN', name: 'Guinée', phoneCode: '+224' },
  { code: 'MR', name: 'Mauritanie', phoneCode: '+222' },
  { code: 'GQ', name: 'Guinée équatoriale', phoneCode: '+240' },
  { code: 'GA', name: 'Gabon', phoneCode: '+241' },
  { code: 'CG', name: 'Congo', phoneCode: '+242' },
  { code: 'CD', name: 'RD Congo', phoneCode: '+243' },
  { code: 'AE', name: 'Émirats Arabes Unis', phoneCode: '+971' },
  { code: 'SA', name: 'Arabie Saoudite', phoneCode: '+966' },
  { code: 'QA', name: 'Qatar', phoneCode: '+974' },
  { code: 'CN', name: 'Chine', phoneCode: '+86' },
  { code: 'JP', name: 'Japon', phoneCode: '+81' },
  { code: 'KR', name: 'Corée du Sud', phoneCode: '+82' },
  { code: 'AU', name: 'Australie', phoneCode: '+61' },
  { code: 'BR', name: 'Brésil', phoneCode: '+55' },
  { code: 'AR', name: 'Argentine', phoneCode: '+54' },
  { code: 'OTHER', name: 'Autre pays', phoneCode: '' },
].sort((a, b) => a.name.localeCompare(b.name))

// Phone number formatting utility - supports international format
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits and non-plus
  let cleaned = value.replace(/[^\d+]/g, '')
  
  // Ensure only one + at the beginning
  if (cleaned.indexOf('+') > 0) {
    cleaned = cleaned.replace(/\+/g, '')
    cleaned = '+' + cleaned
  } else if (cleaned.includes('+') && !cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/\+/g, '')
  }
  
  // If empty or just +, return as is
  if (cleaned.length <= 1) return cleaned
  
  // Auto-add + if starting with digits (assuming international format)
  if (!cleaned.startsWith('+') && cleaned.length > 0) {
    cleaned = '+' + cleaned
  }
  
  // Format the number with spaces for readability
  const digits = cleaned.replace('+', '')
  if (digits.length === 0) return '+'
  
  // Group digits in pairs or triplets from the end
  let formatted = '+'
  let i = 0
  while (i < digits.length) {
    // Add space every 2-3 digits for readability
    if (i > 0 && i % 2 === 0) {
      formatted += ' '
    }
    formatted += digits[i]
    i++
  }
  
  return formatted
}

export function JoinForm() {
  const { setCurrentSection } = useAppStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    placeOfBirth: '',
    phone: '',
    address: '',
    
    // Photo de profil (base64)
    photo: '',
    
    // Type de résidence
    residenceType: 'senegal', // senegal ou diaspora
    
    // Pour les résidents au Sénégal
    regionId: '',
    departmentId: '',
    communeId: '',
    
    // Pour la diaspora
    country: '',
    cityAbroad: '',
    
    // Carte d'identité - OBLIGATOIRE
    cniNumber: '',
    
    // Carte d'électeur
    hasVoterCard: false,
    voterCardNumber: '',
  })

  // Get selected region and department
  const selectedRegion = regions.find(r => r.id === formData.regionId)
  const selectedDepartment = selectedRegion?.departments.find(d => d.id === formData.departmentId)

  // Fetch regions on mount
  useEffect(() => {
    fetch('/api/regions')
      .then(res => res.json())
      .then(data => setRegions(data.regions || []))
      .catch(console.error)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Special handling for phone number
    if (name === 'phone') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
      // Réinitialiser le numéro de carte si décoché
      ...(name === 'hasVoterCard' && !checked ? { voterCardNumber: '' } : {})
    }))
  }

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide')
        return
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 2 Mo')
        return
      }
      
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result as string
        }))
        setError('') // Clear any previous error
      }
      reader.readAsDataURL(file)
    }
  }

  const validateStep = (currentStep: number): boolean => {
    setError('')
    
    if (currentStep === 1) {
      // Photo de profil OBLIGATOIRE
      if (!formData.photo) {
        setError('La photo de profil est obligatoire')
        return false
      }
      if (!formData.firstName.trim()) {
        setError('Le prénom est obligatoire')
        return false
      }
      if (!formData.lastName.trim()) {
        setError('Le nom est obligatoire')
        return false
      }
      if (!formData.dateOfBirth) {
        setError('La date de naissance est obligatoire')
        return false
      }
      if (!formData.placeOfBirth.trim()) {
        setError('Le lieu de naissance est obligatoire')
        return false
      }
      if (!formData.email.trim()) {
        setError('L\'email est obligatoire')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Veuillez entrer une adresse email valide')
        return false
      }
      // Validation du téléphone - format international accepté
      if (!formData.phone.trim()) {
        setError('Le numéro de téléphone est obligatoire')
        return false
      }
      // Remove spaces and validate: must start with + followed by country code and number
      const phoneClean = formData.phone.replace(/[\s\-\.]/g, '')
      if (!/^\+[1-9]\d{6,}$/.test(phoneClean)) {
        setError('Veuillez entrer un numéro valide avec l\'indicatif pays (ex: +221 77 000 00 00, +33 6 00 00 00 00, +1 555 123 4567)')
        return false
      }
      if (!formData.password) {
        setError('Le mot de passe est obligatoire')
        return false
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return false
      }
    }
    
    if (currentStep === 2) {
      if (!formData.address.trim()) {
        setError('L\'adresse est obligatoire')
        return false
      }
      
      if (formData.residenceType === 'senegal') {
        if (!formData.regionId) {
          setError('La région est obligatoire')
          return false
        }
        if (!formData.departmentId) {
          setError('Le département est obligatoire')
          return false
        }
        if (!formData.communeId) {
          setError('La commune est obligatoire')
          return false
        }
      } else {
        if (!formData.country) {
          setError('Le pays de résidence est obligatoire')
          return false
        }
        if (!formData.cityAbroad.trim()) {
          setError('La ville de résidence est obligatoire')
          return false
        }
      }
    }
    
    if (currentStep === 3) {
      if (!formData.cniNumber.trim()) {
        setError('Le numéro de carte d\'identité est obligatoire')
        return false
      }
      if (formData.hasVoterCard && !formData.voterCardNumber.trim()) {
        setError('Le numéro de carte d\'électeur est obligatoire si vous en possédez une')
        return false
      }
    }
    
    return true
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      // Scroll to top on step change
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        // Ajouter le type de résidence pour différencier
        isDiaspora: formData.residenceType === 'diaspora',
      }

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
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

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 animate-fade-in mobile-bottom-padding">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#008751]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#008751]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#008751] mb-4">Inscription réussie !</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
              Votre demande d'adhésion a été enregistrée avec succès. 
              Notre équipe va examiner votre dossier et valider votre compte sous 48h.
            </p>
            <Alert className="mb-6 bg-[#FFD100]/10 border-[#FFD100]">
              <AlertDescription className="text-sm">
                Vous recevrez un email de confirmation une fois votre compte validé.
              </AlertDescription>
            </Alert>
            <Button 
              className="bg-[#008751] hover:bg-[#006b40] min-h-[48px] w-full md:w-auto"
              onClick={() => setCurrentSection('home')}
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in mobile-bottom-padding">
      {/* Back button - Mobile friendly */}
      <Button 
        variant="ghost" 
        className="mb-4 min-h-[44px] px-2 touch-manipulation active-scale"
        onClick={() => setCurrentSection('home')}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card className="mobile-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl md:text-2xl text-[#008751]">Adhérer au Parti</CardTitle>
            <CardDescription className="text-sm">
              Rejoignez Renaissance Républicaine Sunu Reew et participez au changement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps - Mobile optimized */}
            <div className="flex items-center justify-between mb-6 px-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <button
                    onClick={() => s < step && setStep(s)}
                    disabled={s >= step}
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm md:text-base transition-all touch-manipulation",
                      step >= s 
                        ? 'bg-[#008751] text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
                      s < step && "cursor-pointer hover:ring-2 hover:ring-[#008751]/50"
                    )}
                    aria-label={`Étape ${s}${s < step ? ' - Cliquer pour revenir' : ''}`}
                  >
                    {s}
                  </button>
                  {s < 3 && (
                    <div className={cn(
                      "w-12 md:w-20 h-1 mx-1 rounded-full transition-colors",
                      step > s ? 'bg-[#008751]' : 'bg-gray-200 dark:bg-gray-700'
                    )} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mb-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-[#008751]">Étape {step}/3:</span>{' '}
              {
                step === 1 ? 'Informations personnelles' :
                step === 2 ? 'Adresse et localisation' :
                'Documents et validation'
              }
            </div>

            {error && (
              <Alert className="mb-6 bg-[#CE1126]/10 border-[#CE1126]">
                <AlertDescription className="text-[#CE1126] text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Photo de profil - OBLIGATOIRE */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className={cn(
                      "w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors",
                      formData.photo ? "border-[#008751]/20" : "border-[#CE1126]"
                    )}>
                      {formData.photo ? (
                        <img 
                          src={formData.photo} 
                          alt="Photo de profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#008751] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#006b40] transition-colors touch-manipulation active-scale">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        aria-label="Télécharger une photo de profil"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Photo de profil <span className="text-[#CE1126] font-medium">*</span>
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG - Max 2 Mo - Obligatoire</p>
                </div>

                {/* Name fields - Stack on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Votre prénom"
                      className="mt-1.5 min-h-[48px] text-base"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      className="mt-1.5 min-h-[48px] text-base"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                {/* Date and place of birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="mt-1.5 min-h-[48px] text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth" className="text-sm font-medium">Lieu de naissance *</Label>
                    <Input
                      id="placeOfBirth"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleInputChange}
                      placeholder="Ville de naissance"
                      className="mt-1.5 min-h-[48px] text-base"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
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
                      inputMode="email"
                      required
                    />
                  </div>
                </div>

                {/* Phone - Format international */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Téléphone *</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+XXX XX XXX XX XX"
                      className="pl-10 min-h-[48px] text-base"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Format international accepté (ex: <span className="font-medium">+221 77 000 00 00</span> Sénégal, 
                    <span className="font-medium"> +33 6 00 00 00 00</span> France, 
                    <span className="font-medium"> +1 555 123 4567</span> USA/Canada, etc.)
                  </p>
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe *</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Min. 6 caractères"
                        className="min-h-[48px] text-base pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer *</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Retapez le mot de passe"
                        className="min-h-[48px] text-base pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                        aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address & Location */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Type de résidence */}
                <div>
                  <Label className="text-sm font-medium">Résidence *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        residenceType: 'senegal',
                        country: '',
                        cityAbroad: ''
                      }))}
                      className={cn(
                        "p-4 border-2 rounded-xl text-center transition-all touch-manipulation active-scale min-h-[80px]",
                        formData.residenceType === 'senegal' 
                          ? 'border-[#008751] bg-[#008751]/5 text-[#008751]' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <MapPin className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium text-sm">Sénégal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        residenceType: 'diaspora',
                        regionId: '',
                        departmentId: '',
                        communeId: ''
                      }))}
                      className={cn(
                        "p-4 border-2 rounded-xl text-center transition-all touch-manipulation active-scale min-h-[80px]",
                        formData.residenceType === 'diaspora' 
                          ? 'border-[#008751] bg-[#008751]/5 text-[#008751]' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium text-sm">Diaspora</span>
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">Adresse complète *</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Votre adresse complète"
                      className="pl-10 min-h-[80px] text-base pt-3"
                      autoComplete="street-address"
                      required
                    />
                  </div>
                </div>

                {/* Formulaire Sénégal */}
                {formData.residenceType === 'senegal' && (
                  <>
                    {/* Cascading Region -> Department -> Commune */}
                    <div>
                      <Label className="text-sm font-medium">Région *</Label>
                      <Select 
                        value={formData.regionId} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          regionId: value, 
                          departmentId: '', 
                          communeId: '' 
                        }))}
                      >
                        <SelectTrigger className="mt-1.5 min-h-[48px] text-base">
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {regions.map(region => (
                            <SelectItem key={region.id} value={region.id} className="min-h-[44px]">
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.regionId && selectedRegion && (
                      <div>
                        <Label className="text-sm font-medium">Département *</Label>
                        <Select 
                          value={formData.departmentId} 
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            departmentId: value, 
                            communeId: '' 
                          }))}
                        >
                          <SelectTrigger className="mt-1.5 min-h-[48px] text-base">
                            <SelectValue placeholder="Sélectionner un département" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {selectedRegion.departments.map(dept => (
                              <SelectItem key={dept.id} value={dept.id} className="min-h-[44px]">
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.departmentId && selectedDepartment && (
                      <div>
                        <Label className="text-sm font-medium">Commune *</Label>
                        <Select 
                          value={formData.communeId} 
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            communeId: value 
                          }))}
                        >
                          <SelectTrigger className="mt-1.5 min-h-[48px] text-base">
                            <SelectValue placeholder="Sélectionner une commune" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {selectedDepartment.communes.map(commune => (
                              <SelectItem key={commune.id} value={commune.id} className="min-h-[44px]">
                                {commune.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Summary of selected location */}
                    {formData.regionId && formData.departmentId && formData.communeId && (
                      <div className="p-4 bg-[#008751]/5 rounded-xl border border-[#008751]/20">
                        <p className="text-sm font-medium text-[#008751] mb-1">Localisation sélectionnée :</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedDepartment?.communes.find(c => c.id === formData.communeId)?.name}, {' '}
                          {selectedDepartment?.name}, {' '}
                          {selectedRegion?.name}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Formulaire Diaspora */}
                {formData.residenceType === 'diaspora' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Pays de résidence *</Label>
                      <Select 
                        value={formData.country} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          country: value 
                        }))}
                      >
                        <SelectTrigger className="mt-1.5 min-h-[48px] text-base">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {diasporaCountries.map(country => (
                            <SelectItem key={country.code} value={country.code} className="min-h-[44px]">
                              {country.name} {country.phoneCode && `(${country.phoneCode})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cityAbroad" className="text-sm font-medium">Ville de résidence *</Label>
                      <Input
                        id="cityAbroad"
                        name="cityAbroad"
                        value={formData.cityAbroad}
                        onChange={handleInputChange}
                        placeholder="Ex: Paris, New York, Milan..."
                        className="mt-1.5 min-h-[48px] text-base"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Numéro CNI - OBLIGATOIRE */}
                <div>
                  <Label htmlFor="cniNumber" className="text-sm font-medium">Numéro de Carte Nationale d'Identité (CNI) *</Label>
                  <div className="relative mt-1.5">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="cniNumber"
                      name="cniNumber"
                      value={formData.cniNumber}
                      onChange={handleInputChange}
                      placeholder="Ex: 1234567890123"
                      className="pl-10 min-h-[48px] text-base"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Renseignez le numéro figurant sur votre carte d'identité sénégalaise
                  </p>
                </div>

                {/* Carte d'électeur - CONDITIONNEL */}
                <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="hasVoterCard"
                      checked={formData.hasVoterCard}
                      onCheckedChange={(checked) => handleCheckboxChange('hasVoterCard', checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="hasVoterCard" className="font-medium cursor-pointer">
                        Possédez-vous une carte d'électeur ?
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Cochez cette case si vous disposez d'une carte d'électeur sénégalaise
                      </p>
                    </div>
                  </div>

                  {/* Champ conditionnel pour le numéro de carte d'électeur */}
                  {formData.hasVoterCard && (
                    <div className="mt-4 animate-fade-in">
                      <Label htmlFor="voterCardNumber" className="text-sm font-medium">Numéro de carte d'électeur *</Label>
                      <Input
                        id="voterCardNumber"
                        name="voterCardNumber"
                        value={formData.voterCardNumber}
                        onChange={handleInputChange}
                        placeholder="Ex: 123456789"
                        className="mt-1.5 min-h-[48px] text-base"
                        autoComplete="off"
                        required
                      />
                    </div>
                  )}
                </div>

                <Alert className="bg-[#008751]/10 border-[#008751]">
                  <AlertDescription className="text-sm">
                    <strong>Engagement :</strong> En soumettant ce formulaire, vous acceptez les conditions d'adhésion 
                    au parti Renaissance Républicaine Sunu Reew et vous vous engagez à 
                    respecter ses statuts et son règlement intérieur.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-[#FFD100]/10 border-[#FFD100]">
                  <AlertDescription className="text-sm">
                    <strong>Important :</strong> Tous les champs marqués d'un astérisque (*) sont obligatoires.
                    Votre demande sera examinée par notre équipe dans un délai de 48h.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons - Mobile optimized */}
            <div className="flex justify-between mt-8 gap-4">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="min-h-[48px] px-6 touch-manipulation active-scale flex-1 md:flex-none"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Précédent
                </Button>
              ) : (
                <div className="flex-1" />
              )}

              {step < 3 ? (
                <Button
                  className="bg-[#008751] hover:bg-[#006b40] min-h-[48px] px-6 touch-manipulation active-scale flex-1 md:flex-none"
                  onClick={handleNextStep}
                >
                  Suivant
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button
                  className="bg-[#008751] hover:bg-[#006b40] min-h-[48px] px-6 touch-manipulation active-scale flex-1 md:flex-none"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      Soumettre l'adhésion
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}