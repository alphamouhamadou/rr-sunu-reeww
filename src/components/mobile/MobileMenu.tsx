'use client'

import { useAppStore } from '@/store/useAppStore'
import { 
  X, Home, Newspaper, Eye, UserPlus, Heart, 
  Sun, Moon, Menu
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const baseNavItems = [
  { id: 'home', label: 'Accueil', icon: Home, description: 'Page principale' },
  { id: 'news', label: 'Actualités', icon: Newspaper, description: 'Dernières nouvelles' },
  { id: 'vision', label: 'Notre Vision', icon: Eye, description: 'Programme du parti' },
  { id: 'donate', label: 'Faire un Don', icon: Heart, description: 'Soutenir le parti' },
]

const joinItem = { id: 'join', label: 'Adhérer', icon: UserPlus, description: 'Rejoindre le parti' }

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { currentSection, setCurrentSection } = useAppStore()
  const { theme, setTheme } = useTheme()

  const navItems = [...baseNavItems.slice(0, 3), joinItem, baseNavItems[3]]

  const handleNavClick = (id: string) => {
    setCurrentSection(id as any)
    onClose()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
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
                <p className="text-xs text-gray-500">Sunu Reew</p>
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

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
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
                  isActive 
                    ? "bg-[#008751] text-white shadow-lg" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className={cn(
                    "text-xs",
                    isActive ? "text-white/70" : "text-gray-500"
                  )}>
                    {item.description}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />

        {/* Theme Toggle */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[56px]"
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
              <p className="text-xs text-gray-500">
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

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Ouvrir le menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}