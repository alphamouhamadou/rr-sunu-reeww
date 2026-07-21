'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { Building2, Leaf, GraduationCap, Stethoscope, Factory, ArrowRight, Users, CheckCircle, Target, Heart, Lightbulb, Globe } from 'lucide-react'
import Image from 'next/image'

const pillars = [
  {
    icon: GraduationCap,
    title: 'Éducation & Formation',
    description: "Investir dans l'éducation de qualité pour tous, de la maternelle à l'université, avec un accent sur la formation professionnelle pour l'emploi des jeunes.",
    color: 'text-[#008751]',
    bgColor: 'bg-[#008751]/10',
  },
  {
    icon: Stethoscope,
    title: 'Santé pour Tous',
    description: "Garantir l'accès aux soins de santé pour chaque Sénégalais, avec des infrastructures modernes et des programmes de prévention efficaces.",
    color: 'text-[#CE1126]',
    bgColor: 'bg-[#CE1126]/10',
  },
  {
    icon: Leaf,
    title: 'Souveraineté Alimentaire',
    description: 'Moderniser notre agriculture pour nourrir le Sénégal, soutenir nos agriculteurs et réduire notre dépendance aux importations.',
    color: 'text-[#008751]',
    bgColor: 'bg-[#008751]/10',
  },
  {
    icon: Factory,
    title: 'Industrialisation',
    description: "Développer une industrie nationale créatrice d'emplois, valorisant nos ressources locales et compétitive à l'échelle continentale.",
    color: 'text-[#FFD100]',
    bgColor: 'bg-[#FFD100]/10',
  },
  {
    icon: Building2,
    title: 'Infrastructures',
    description: 'Construire des routes, des ponts, des logements et des équipements publics pour connecter toutes les régions et améliorer le cadre de vie.',
    color: 'text-[#008751]',
    bgColor: 'bg-[#008751]/10',
  },
  {
    icon: Users,
    title: 'Cohésion Sociale',
    description: "Renforcer l'unité nationale, promouvoir le dialogue intercommunautaire et garantir l'égalité des chances pour tous les citoyens.",
    color: 'text-[#CE1126]',
    bgColor: 'bg-[#CE1126]/10',
  },
]

const values = [
  { title: 'Démocratie', description: 'Respect des institutions et de la volonté du peuple', icon: Target },
  { title: 'Transparence', description: 'Gestion rigoureuse et rendu de comptes', icon: Lightbulb },
  { title: 'Solidarité', description: 'Entraide et cohésion sociale', icon: Heart },
  { title: 'Innovation', description: 'Solutions créatives pour les défis de demain', icon: Globe },
]

const achievements = [
  { title: 'Ancien Ministre de la Santé', year: '2012-2019' },
  { title: 'Député à l\'Assemblée Nationale', year: '2007-2012' },
  { title: 'Maire de Fissel', year: '2009-2014' },
  { title: 'Président de Commission', year: 'Multiple mandats' },
]

export function VisionSection() {
  const { setCurrentSection } = useAppStore()

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="party-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Notre Vision pour le Sénégal</h1>
            <p className="text-xl text-green-100">
              Un Sénégal prospère, uni et solidaire, où chaque citoyen peut réaliser son plein potentiel.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Images - Affichage direct en grand */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1 bg-[#008751]/10 dark:bg-[#008751]/20 rounded-full text-[#008751] font-semibold text-sm mb-4">
              Notre Projet
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Un Programme pour le Sénégal</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez notre vision et nos engagements pour bâtir un Sénégal émergent
            </p>
          </div>

          {/* Images en grille 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Image 1 */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="/vision/vision-1.png" 
                alt="Vision 1"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Image 2 */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="/vision/vision-2.png" 
                alt="Vision 2"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Image 3 */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="/vision/vision-3.png" 
                alt="Vision 3"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Image 4 */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="/vision/vision-4.png" 
                alt="Vision 4"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SG Biography with Photo */}
      

      {/* Our Values */}
      <section className="py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nos Valeurs</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Les principes qui guident notre action et définissent notre identité politique
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition border-0 shadow group bg-gray-50 dark:bg-gray-800">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 rounded-full party-gradient mx-auto mb-4 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-[#008751]">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Program Pillars */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Les Piliers de Notre Programme</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Un programme ambitieux et réaliste pour transformer le Sénégal
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <Card key={idx} className="hover:shadow-lg transition group border-0 shadow bg-white dark:bg-gray-700">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl ${pillar.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <pillar.icon className={`w-7 h-7 ${pillar.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{pillar.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 party-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Rejoignez notre vision</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Votre engagement compte. Ensemble, construisons le Sénégal de demain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-[#FFD100] text-black hover:bg-[#e6bc00] font-semibold"
              onClick={() => setCurrentSection('join')}
            >
              Adhérer au parti
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
          </div>
        </div>
      </section>
    </div>
  )
}