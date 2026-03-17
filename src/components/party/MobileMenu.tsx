'use client'

import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { 
  X, Home, Newspaper, Eye, UserPlus, Heart, User, 
  LogOut, Settings, Sun, Moon, ChevronRight, Menu
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { currentSection, setCurrentSection, member, logout } = useAppStore()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { id: 'home' as const, label: 'Accueil', icon: Home, description: 'Page principale' },
    { id: 'news' as const, label: 'Actualités', icon: Newspaper, description: 'Dernières nouvelles' },
    { id: 'vision' as const, label: 'Notre Vision', icon: Eye, description: 'Programme du parti' },
    { id: 'join' as const, label: 'Adhérer', icon: UserPlus, description: 'Rejoindre le parti' },
    { id: 'donate' as const, label: 'Faire un Don', icon: Heart, description: 'Soutenir le parti' },
  ]

  const handleNavClick = (id: typeof currentSection) => {
    setCurrentSection(id)
    onClose()
    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-left overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
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
                <h2 className="font-bold text-[#008751] text-sm leading-tight">Renaissance Républicaine</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sunu Reew</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Section (if logged in) */}
        {member && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 p-3 bg-[#008751]/5 dark:bg-[#008751]/10 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#008751] flex items-center justify-center text-white font-bold text-lg">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {member.membershipNumber || 'Membre en attente'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4 space-y-1" role="navigation" aria-label="Navigation principale">
          {navItems.map((item) => {
            const isActive = currentSection === item.id
            const Icon = item.icon
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                  "touch-manipulation select-none min-h-[56px]",
                  "active:scale-[0.98]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008751] focus-visible:ring-offset-2",
                  isActive 
                    ? "bg-[#008751] text-white shadow-lg shadow-[#008751]/30" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className={cn(
                    "text-xs",
                    isActive ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />

        {/* Auth Section */}
        <div className="p-4 space-y-2">
          {member ? (
            <>
              <button
                onClick={() => handleNavClick('member')}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[56px] touch-manipulation"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#008751]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Espace Membre</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gérer votre compte</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {member.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[56px] touch-manipulation"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Administration</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Panneau d'administration</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[56px] touch-manipulation"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-[#CE1126]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#CE1126]">Déconnexion</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quitter votre session</p>
                </div>
              </button>
            </>
          ) : (
            <Button
              onClick={() => handleNavClick('login')}
              className="w-full bg-[#008751] hover:bg-[#006b40] h-12 text-base font-semibold"
            >
              <User className="w-5 h-5 mr-2" />
              Espace Membre
            </Button>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[56px] touch-manipulation"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#FFD100]" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center">
          <p className="text-xs text-gray-400">
            © 2024 Renaissance Républicaine Sunu Reew
          </p>
        </div>
      </div>
    </div>
  )
}

// Hamburger button component to trigger the menu
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
      aria-label="Ouvrir le menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}
