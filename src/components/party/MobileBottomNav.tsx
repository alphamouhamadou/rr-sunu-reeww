'use client'

import { useAppStore } from '@/store/useAppStore'
import { Home, Newspaper, Eye, UserPlus, Heart, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: 'home' | 'news' | 'vision' | 'join' | 'donate' | 'member' | 'admin'
  label: string
  icon: React.ElementType
  requiresAuth?: boolean
  requiresAdmin?: boolean
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'news', label: 'Actus', icon: Newspaper },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'join', label: 'Rejoindre', icon: UserPlus },
  { id: 'donate', label: 'Don', icon: Heart },
]

export function MobileBottomNav() {
  const { currentSection, setCurrentSection, member } = useAppStore()

  // Build navigation items based on auth state
  const visibleNavItems = navItems.filter(item => {
    if (item.requiresAuth && !member) return false
    if (item.requiresAdmin && member?.role !== 'admin') return false
    return true
  })

  // Add member/admin items if logged in
  const allNavItems = [...visibleNavItems]
  if (member) {
    allNavItems[4] = { id: 'member', label: 'Compte', icon: User, requiresAuth: true }
    if (member.role === 'admin') {
      allNavItems.push({ id: 'admin', label: 'Admin', icon: Settings, requiresAdmin: true })
    }
  }

  const handleNavClick = (id: NavItem['id']) => {
    setCurrentSection(id)
    // Haptic feedback simulation
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      role="navigation"
      aria-label="Navigation principale mobile"
    >
      {/* Safe area for notched phones */}
      <div className="safe-area-inset-bottom">
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Progress indicator bar */}
          <div className="h-0.5 party-gradient-full opacity-60" />
          
          <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
            {allNavItems.slice(0, 5).map((item) => {
              const isActive = currentSection === item.id
              const Icon = item.icon
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-3 py-1 rounded-xl transition-all duration-200",
                    "touch-manipulation select-none",
                    "active:scale-95 active:bg-gray-100 dark:active:bg-gray-800",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008751] focus-visible:ring-offset-2",
                    isActive 
                      ? "text-[#008751] bg-[#008751]/10" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive && "scale-110"
                    )} 
                  />
                  <span 
                    className={cn(
                      "text-[10px] font-medium mt-0.5 transition-all duration-200",
                      isActive && "font-semibold"
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#008751]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
