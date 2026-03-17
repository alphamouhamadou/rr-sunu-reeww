'use client'

import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Settings, Sun, Moon, Bell } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { MobileMenu } from '@/components/mobile/MobileMenu'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'


export function Header() {
  const { currentSection, setCurrentSection, member, logout } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const navItems = [
    { id: 'home' as const, label: 'Accueil' },
    { id: 'news' as const, label: 'Actualités' },
    //{ id: 'gallery' as const, label: 'Galerie' },
    { id: 'vision' as const, label: 'Notre Vision' },
    { id: 'donate' as const, label: 'Faire un Don' },
  ]

  const handleNavClick = (id: string) => {
    setCurrentSection(id as any)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Header - Hidden on mobile */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
        {/* Top bar with party colors */}
        <div className="h-1 party-gradient-full"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => setCurrentSection('home')}
              className="flex items-center gap-3 touch-manipulation min-h-[44px] px-2"
              aria-label="Aller à l'accueil"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden party-gradient flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="RR Sunu Reew" 
                  width={48} 
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-[#008751] dark:text-[#4ade80] leading-tight">Renaissance Républicaine</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sunu Reew</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-1" role="navigation" aria-label="Navigation principale">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "min-h-[44px] px-4 transition-all duration-200",
                    currentSection === item.id ? 'bg-[#008751] hover:bg-[#006b40]' : ''
                  )}
                  aria-current={currentSection === item.id ? 'page' : undefined}
                >
                  {item.label}
                </Button>
              ))}
              {/* Bouton Adhérer visible seulement si non connecté */}
              {!member && (
                <Button
                  variant={currentSection === 'join' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavClick('join')}
                  className={cn(
                    "min-h-[44px] px-4 transition-all duration-200",
                    currentSection === 'join' ? 'bg-[#008751] hover:bg-[#006b40]' : ''
                  )}
                  aria-current={currentSection === 'join' ? 'page' : undefined}
                >
                  Adhérer
                </Button>
              )}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full min-w-[44px] min-h-[44px]"
                aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {member ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentSection('member')}
                    className="flex items-center gap-2 min-h-[44px]"
                  >
                    <User className="w-4 h-4" />
                    {member.firstName}
                  </Button>
                  {member.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSection('admin')}
                      className="flex items-center gap-2 min-h-[44px]"
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogoutDialog(true)}
                    className="text-[#CE1126] min-h-[44px] min-w-[44px]"
                    aria-label="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setCurrentSection('login')}
                  size="sm"
                  className="bg-[#008751] hover:bg-[#006b40] min-h-[44px] px-6"
                >
                  Espace Membre
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Compact Header - Visible only on mobile */}
      <header className="lg:hidden sticky top-0 z-50 safe-area-inset-top">
        {/* Top bar with party colors */}
        <div className="h-1 party-gradient-full"></div>
        
        <div className="bg-white dark:bg-gray-900 shadow-md">
          <div className="flex items-center justify-between h-14 px-3">
            {/* Logo - Compact */}
            <button 
              onClick={() => setCurrentSection('home')}
              className="flex items-center gap-2 touch-manipulation min-h-[44px]"
              aria-label="Aller à l'accueil"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden party-gradient flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="RR Sunu Reew" 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-[#008751] dark:text-[#4ade80] text-sm leading-tight">RR Sunu Reew</h1>
              </div>
            </button>

            {/* Right side - User avatar + Menu */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 rounded-full flex items-center justify-center touch-manipulation active:bg-gray-100 dark:active:bg-gray-800"
                aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {member ? (
                <button
                  onClick={() => setCurrentSection('member')}
                  className="w-10 h-10 rounded-full bg-[#008751] flex items-center justify-center text-white font-bold text-sm touch-manipulation"
                  aria-label={`Connecté en tant que ${member.firstName}`}
                >
                  {member.firstName[0]}{member.lastName[0]}
                </button>
              ) : (
                <Button
                  onClick={() => setCurrentSection('login')}
                  size="sm"
                  className="bg-[#008751] hover:bg-[#006b40] min-h-[40px] px-3 text-sm"
                >
                  Connexion
                </Button>
              )}
              
              {/* Menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center touch-manipulation active:bg-gray-100 dark:active:bg-gray-800"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dialog de confirmation de déconnexion */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre espace membre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-[#CE1126] hover:bg-[#a00e1e]"
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Menu avec prop onLogoutClick */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        onLogoutClick={() => setShowLogoutDialog(true)}
      />
    </>
  )
}