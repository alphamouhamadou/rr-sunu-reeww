'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Header } from '@/components/party/Header'
import { HeroSection } from '@/components/party/HeroSection'
import { NewsSection } from '@/components/party/NewsSection'
import { VisionSection } from '@/components/party/VisionSection'
import { JoinForm } from '@/components/party/JoinForm'
import { DonationSection } from '@/components/party/DonationSection'
import { LoginForm } from '@/components/party/LoginForm'
import { MemberSpace } from '@/components/party/MemberSpace'
import { AdminSpace } from '@/components/party/AdminSpace'
import { LiveStreamSection } from '@/components/party/LiveStreamSection'
import { NewsletterSection } from '@/components/party/NewsletterSection'
import { GallerySection } from '@/components/party/GallerySection'
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav'
import { cn } from '@/lib/utils'
// Ajouter l'import en haut
import { ResetPasswordSection } from '@/components/party/ResetPasswordSection'


export default function Home() {
  const { currentSection, member } = useAppStore()
  const [seeded, setSeeded] = useState(false)

  // Seed database on first load
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        const res = await fetch('/api/seed')
        const data = await res.json()
        if (data.message) setSeeded(true)
      } catch (error) {
        console.error('Seed error:', error)
        setSeeded(true)
      }
    }
    seedDatabase()
  }, [])

  // Add mobile bottom padding class to body
  useEffect(() => {
    document.body.classList.add('mobile-bottom-padding')
    return () => document.body.classList.remove('mobile-bottom-padding')
  }, [])

  if (!seeded) {
    return (
      <div className="min-h-screen flex items-center justify-center party-gradient">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <ResetPasswordSection />
      <main className={cn(
        // Add bottom padding on mobile to prevent content from being hidden by bottom nav
        "pb-20 md:pb-0"
      )}>
        {currentSection === 'home' && (
          <>
            <HeroSection />
            <LiveStreamSection />
          </>
        )}
        {currentSection === 'news' && <NewsSection />}
        {currentSection === 'vision' && <VisionSection />}
        {currentSection === 'join' && <JoinForm />}
        {currentSection === 'donate' && <DonationSection />}
        {currentSection === 'login' && <LoginForm />}
        {currentSection === 'member' && member && <MemberSpace />}
        {currentSection === 'admin' && member?.role === 'admin' && <AdminSpace />}
        
      </main>

      {/* Footer - Hidden on mobile since we have bottom nav */}
      <footer className="bg-gray-900 text-white py-8 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#FFD100]">Renaissance Républicaine Sunu Reew</h3>
              <p className="text-gray-400 text-sm">
                Parti politique sénégalais engagé pour le développement, la démocratie et le bien-être des populations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => useAppStore.getState().setCurrentSection('home')} className="hover:text-white transition">Accueil</button></li>
                <li><button onClick={() => useAppStore.getState().setCurrentSection('news')} className="hover:text-white transition">Actualités</button></li>
                <li><button onClick={() => useAppStore.getState().setCurrentSection('vision')} className="hover:text-white transition">Notre Vision</button></li>
                <li><button onClick={() => useAppStore.getState().setCurrentSection('join')} className="hover:text-white transition">Adhérer</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Siège: Dakar, Sénégal</li>
                <li>Email: contact@renaissancerepublicaine.sn</li>
                <li>Tél: +221 77 621 13 39</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suivez-nous</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61576265687376" className="text-gray-400 hover:text-[#FFD100] transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61576265687376" className="text-gray-400 hover:text-[#FFD100] transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 Renaissance Républicaine Sunu Reew. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
