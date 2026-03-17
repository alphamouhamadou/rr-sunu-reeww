'use client'

import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChevronRight, Users, Heart, Target, Newspaper, CalendarDays, Mail, Bell, Sparkles, CheckCircle2, Loader2, Award, Briefcase, GraduationCap, MapPin, Calendar, Building2, TrendingUp, Landmark, Bus, Stethoscope, Trash2, Plane, School, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

// Newsletter Section Component
function NewsletterSectionInline() {
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
                <Input
                  type="text"
                  placeholder="Votre nom (optionnel)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-white/10 border-gray-700 text-white placeholder-gray-400 focus:border-[#FFD100] focus:ring-[#FFD100]/20 h-12 rounded-xl"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
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

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  createdAt: string
}

interface Event {
  id: string
  title: string
  date: string
  location: string
  imageUrl: string | null
  description: string | null
}

export function HeroSection() {
  const { setCurrentSection, member } = useAppStore()
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    // Fetch featured articles
    fetch('/api/articles?featured=true&limit=3')
      .then(res => res.json())
      .then(data => setFeaturedArticles(data.articles || []))
      .catch(console.error)

    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setMemberCount(data.members?.total || 0))
      .catch(console.error)

    // Fetch events
    fetch('/api/events?upcoming=true&limit=3')
      .then(res => res.json())
      .then(data => setUpcomingEvents(data.events || []))
      .catch(console.error)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Banner with Logo and SG Photo */}
      <section className="relative party-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Logo très visible en haut */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-[#FFD100] rounded-full blur-2xl opacity-30 scale-150"></div>
            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-2xl border-4 border-[#FFD100]">
              <Image
                src="/logo.png"
                alt="RR Sunu Reew Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center pt-20 md:pt-16">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#FFD100] animate-pulse"></span>
                <span className="text-sm font-medium">Ensemble pour le Sénégal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Renaissance Républicaine<br />
                <span className="text-[#FFD100]">Sunu Reew</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-green-100 max-w-xl">
                Ensemble, construisons un Sénégal prospère, uni et solidaire sous le leadership d'Abdoulaye Diouf Sarr
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                {!member && (
                  <Button 
                    size="lg" 
                    className="bg-[#FFD100] text-black hover:bg-[#e6bc00] font-semibold shadow-lg shadow-yellow-500/30"
                    onClick={() => setCurrentSection('join')}
                  >
                    Rejoindre le parti
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
                <Button 
                  size="lg" 
                  //variant="outline" 
                  className="border-white text-white hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => setCurrentSection('vision')}
                >
                  Notre Programme
                </Button>
              </div>
            </div>

            {/* Right: SG Photo */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-t from-[#008751] via-transparent to-transparent z-10 rounded-2xl"></div>
              <div className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <Image
                  src="/sg-photo.jpg"
                  alt="Abdoulaye Diouf Sarr - Secrétaire Général"
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
                  <p className="text-2xl font-bold">Abdoulaye Diouf Sarr</p>
                  <p className="text-[#FFD100] font-medium">Secrétaire Général</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#FFD100] rounded-full opacity-30 blur-2xl"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#CE1126] rounded-full opacity-30 blur-2xl"></div>
            </div>
          </div>
        </div>
        
        {/* Flag stripes at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex">
          <div className="flex-1 bg-[#008751]"></div>
          <div className="flex-1 bg-[#FFD100]"></div>
          <div className="flex-1 bg-[#CE1126]"></div>
        </div>
      </section>

      {/* Stats Section */}
      

      {/* About SG Section - Enrichie avec parcours détaillé */}
      <section className="py-20 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1 bg-[#008751]/10 dark:bg-[#008751]/20 rounded-full text-[#008751] font-semibold text-sm mb-4">
              Le Leadership
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Le Secrétaire Général
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Photo SG */}
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="aspect-[4/5] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/sg-photo.jpg"
                    alt="Abdoulaye Diouf Sarr"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#FFD100] rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#CE1126] rounded-full opacity-30 blur-2xl"></div>
                
                {/* Name Card */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 w-[90%] max-w-xs">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Abdoulaye Diouf Sarr</h3>
                  <p className="text-[#008751] font-medium text-center">Secrétaire Général</p>
                </div>
              </div>
            </div>

            {/* Infos détaillées */}
            <div className="lg:col-span-2 space-y-8 pt-8 lg:pt-0">
              {/* Biographie */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FFD100]" />
                  Biographie
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Né le 30 septembre 1959 à Fatick, <strong className="text-[#008751]">Abdoulaye Diouf Sarr</strong> est une figure emblématique de la politique sénégalaise. Fort de plusieurs décennies d'engagement au service de la nation, il incarne une vision progressiste et humaniste pour le Sénégal. Son parcours exceptionnel allie expertise technique, expérience gouvernementale et engagement social profond.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  Homme de terrain et de convictions, il a consacré sa vie à l'amélioration des conditions de vie des Sénégalais. Aujourd'hui, à la tête de Renaissance Républicaine Sunu Reew, il porte un projet ambitieux pour un Sénégal émergent, uni et prospère.
                </p>
              </div>

              {/* Parcours détaillé */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#FFD100]" />
                  Parcours Politique et Professionnel
                </h4>
                
                <div className="space-y-4">
                  {/* FONSIS */}
                  <div className="bg-gradient-to-r from-[#008751]/10 to-transparent dark:from-[#008751]/20 rounded-xl p-5 border-l-4 border-[#008751]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#008751] flex items-center justify-center flex-shrink-0">
                        <Landmark className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">Directeur général du FONSIS</h5>
                        <p className="text-sm text-[#008751] font-medium mb-2">Fonds Souverain d'Investissements Stratégiques</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Il a piloté des investissements stratégiques majeurs pour le Sénégal, notamment la réception des 
                          <strong> Bus Rapid Transit (BRT)</strong>, projet dans lequel Dakar Mobilité, une des entreprises du portefeuille d'investissement du FONSIS, gère l'exploitation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vice-Président Assemblée Nationale */}
                  <div className="bg-gradient-to-r from-[#FFD100]/10 to-transparent dark:from-[#FFD100]/20 rounded-xl p-5 border-l-4 border-[#FFD100]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFD100] flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">1er Vice-Président de l'Assemblée nationale</h5>
                        <p className="text-sm text-[#FFD100] font-medium mb-2">Septembre 2022 - Mai 2023</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Élu vice-président de l'Assemblée nationale, il a contribué au bon fonctionnement de l'institution législative et à l'adoption de textes de loi majeurs pour le pays.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ministre de la Santé */}
                  <div className="bg-gradient-to-r from-[#CE1126]/10 to-transparent dark:from-[#CE1126]/20 rounded-xl p-5 border-l-4 border-[#CE1126]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#CE1126] flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">Ministre de la Santé et de l'Action Sociale</h5>
                        <p className="text-sm text-[#CE1126] font-medium mb-2">Grands projets hospitaliers</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Sous ses fonctions, plusieurs <strong>grands hôpitaux de haut standing</strong> ont été construits dans des régions du Sénégal qui n'en disposaient pas auparavant : 
                          <span className="font-medium"> Touba, Kaffrine, Kédougou, Sédhiou</span>. 
                          Il est le <strong>premier Sénégalais à s'être fait vacciner du COVID</strong> (en direct à la télévision) à la réception des vaccins destinés à lutter contre cette pandémie.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ministre de la Gouvernance locale */}
                  <div className="bg-gradient-to-r from-[#008751]/10 to-transparent dark:from-[#008751]/20 rounded-xl p-5 border-l-4 border-[#008751]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#008751] flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">Ministre de la Gouvernance locale, du Développement et de l'Aménagement du territoire</h5>
                        <p className="text-sm text-[#008751] font-medium mb-2">Programme UCG</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Il a initié le <strong>programme UCG (Unité de Coordination de la Gestion des déchets solides)</strong> visant à lutter contre l'insalubrité dans la capitale, améliorant ainsi la qualité de vie des Dakarois.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ministre du Tourisme */}
                  <div className="bg-gradient-to-r from-[#FFD100]/10 to-transparent dark:from-[#FFD100]/20 rounded-xl p-5 border-l-4 border-[#FFD100]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFD100] flex items-center justify-center flex-shrink-0">
                        <Plane className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">Ministre du Tourisme et des Transports aériens</h5>
                        <p className="text-sm text-[#FFD100] font-medium mb-2">Promotion du Sénégal</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Il a œuvré pour la promotion de la destination Sénégal à l'international et le développement du secteur touristique, pilier important de l'économie nationale.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Directeur COUD */}
                  <div className="bg-gradient-to-r from-[#CE1126]/10 to-transparent dark:from-[#CE1126]/20 rounded-xl p-5 border-l-4 border-[#CE1126]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#CE1126] flex items-center justify-center flex-shrink-0">
                        <School className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">Directeur général du COUD</h5>
                        <p className="text-sm text-[#CE1126] font-medium mb-2">Centre des Œuvres Universitaires de Dakar</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Il a procédé à une <strong>restructuration complète</strong> à travers un programme de réaménagement radical, réglant ainsi le problème de l'occupation anarchique des espaces de l'université. 
                          Il a aménagé plusieurs espaces verts et construit de nouveaux pavillons (bâtiments). Cette restructuration avait <strong>fortement été saluée par les étudiants</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formation */}
              

              {/* Stats personnelles */}
              

              {/* Citation */}
              <div className="bg-gradient-to-r from-[#008751]/10 to-[#FFD100]/10 dark:from-[#008751]/20 dark:to-[#FFD100]/20 rounded-2xl p-6 border border-[#008751]/20">
                <blockquote className="text-lg italic text-gray-700 dark:text-gray-300">
                  "Le Sénégal a besoin de tous ses enfants. Ensemble, nous pouvons bâtir une nation prospère où chaque citoyen a sa place et son opportunité."
                </blockquote>
                <p className="mt-3 font-semibold text-[#008751]">— Abdoulaye Diouf Sarr</p>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setCurrentSection('vision')}
                  className="bg-[#008751] hover:bg-[#006b40]"
                >
                  Découvrir notre vision
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentSection('news')}
                  className="border-[#008751] text-[#008751] hover:bg-[#008751]/10"
                >
                  Ses dernières actualités
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Preview - AFFICHÉ EN PREMIER */}
      

      {/* Upcoming Events - AFFICHÉ EN SECOND */}
      

      {/* Newsletter Section */}
      <NewsletterSectionInline />

      {/* Call to Action */}
      <section className="py-20 party-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Rejoignez notre parti</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Ensemble, nous pouvons construire le Sénégal de demain. 
            Adhérez à Renaissance Républicaine Sunu Reew et participez au changement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!member && (
              <Button 
                size="lg" 
                className="bg-[#FFD100] text-black hover:bg-[#e6bc00] font-semibold"
                onClick={() => setCurrentSection('join')}
              >
                Devenir membre
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            )}
            <Button 
              size="lg" 
              //variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => setCurrentSection('donate')}
            >
              Faire un don
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}