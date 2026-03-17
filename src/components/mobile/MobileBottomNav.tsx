'use client'

import { useAppStore } from '@/store/useAppStore'
import { 
  Home, Newspaper, Eye, UserPlus, Heart, 
  User, Settings, Menu, X, ImageIcon
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  section: 'home' | 'news' | 'vision' | 'join' | 'donate' | 'login' | 'member' | 'admin' 
}

const publicNavItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: <Home className="w-5 h-5" />, section: 'home' },
  { id: 'news', label: 'Actualités', icon: <Newspaper className="w-5 h-5" />, section: 'news' },
  //{ id: 'gallery', label: 'Galerie', icon: <ImageIcon className="w-5 h-5" />, section: 'gallery' },
  { id: 'join', label: 'Rejoindre', icon: <UserPlus className="w-5 h-5" />, section: 'join' },
  { id: 'donate', label: 'Dons', icon: <Heart className="w-5 h-5" />, section: 'donate' },
]

const memberNavItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: <Home className="w-5 h-5" />, section: 'home' },
  { id: 'news', label: 'Actualités', icon: <Newspaper className="w-5 h-5" />, section: 'news' },
  //{ id: 'gallery', label: 'Galerie', icon: <ImageIcon className="w-5 h-5" />, section: 'gallery' },
  { id: 'member', label: 'Espace', icon: <User className="w-5 h-5" />, section: 'member' },
  { id: 'donate', label: 'Dons', icon: <Heart className="w-5 h-5" />, section: 'donate' },
]

const adminNavItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: <Home className="w-5 h-5" />, section: 'home' },
  { id: 'admin', label: 'Admin', icon: <Settings className="w-5 h-5" />, section: 'admin' },
  { id: 'member', label: 'Espace', icon: <User className="w-5 h-5" />, section: 'member' },
  { id: 'donate', label: 'Dons', icon: <Heart className="w-5 h-5" />, section: 'donate' },
]

export function MobileBottomNav() {
  const { currentSection, setCurrentSection, member } = useAppStore()
  const [showMore, setShowMore] = useState(false)

  // Determine which nav items to show based on user role
  const navItems = member?.role === 'admin' 
    ? adminNavItems 
    : member 
      ? memberNavItems 
      : publicNavItems

  // Show only 5 items max on bottom nav
  const visibleItems = navItems.slice(0, 5)

  const handleNavClick = (section: NavItem['section']) => {
    setCurrentSection(section)
    setShowMore(false)
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <>
      {/* Backdrop for more menu */}
      {showMore && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Bottom Navigation Bar */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700",
          "safe-area-bottom"
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {visibleItems.map((item) => {
            const isActive = currentSection === item.section
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.section)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] min-h-[44px]",
                  "touch-manipulation select-none",
                  "transition-all duration-200",
                  "active:scale-95 active:bg-gray-100 dark:active:bg-gray-800",
                  "rounded-lg px-2 py-1",
                  isActive 
                    ? "text-[#008751]" 
                    : "text-gray-500 dark:text-gray-400"
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  "p-1 rounded-full transition-all duration-200",
                  isActive && "bg-[#008751]/10"
                )}>
                  {item.icon}
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5 font-medium leading-tight",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Floating Action Button for Quick Actions */}
      {member && (
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            "fixed right-4 z-50 md:hidden",
            "w-14 h-14 rounded-full",
            "bg-[#008751] text-white",
            "shadow-lg shadow-[#008751]/30",
            "flex items-center justify-center",
            "touch-manipulation select-none",
            "transition-all duration-200",
            "active:scale-90",
            showMore ? "rotate-45" : "rotate-0"
          )}
          style={{
            bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}
          aria-label="Menu rapide"
        >
          {showMore ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Quick Actions Menu */}
      {showMore && member && (
        <div 
          className={cn(
            "fixed right-4 z-50 md:hidden",
            "bg-white dark:bg-gray-900",
            "rounded-2xl shadow-xl",
            "border border-gray-200 dark:border-gray-700",
            "p-2 min-w-[160px]",
            "animate-in slide-in-from-bottom-4 fade-in duration-200"
          )}
          style={{
            bottom: 'calc(150px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <button
            onClick={() => { setCurrentSection('member'); setShowMore(false) }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
          >
            <User className="w-5 h-5 text-[#008751]" />
            <span className="text-sm">Mon Profil</span>
          </button>
          {member.role === 'admin' && (
            <button
              onClick={() => { setCurrentSection('admin'); setShowMore(false) }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
            >
              <Settings className="w-5 h-5 text-[#008751]" />
              <span className="text-sm">Administration</span>
            </button>
          )}
        </div>
      )}
    </>
  )
}
