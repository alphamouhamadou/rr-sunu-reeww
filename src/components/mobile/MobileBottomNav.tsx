'use client'

import { useAppStore } from '@/store/useAppStore'
import { 
  Home, Newspaper, Eye, UserPlus, Heart, 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  section: 'home' | 'news' | 'vision' | 'join' | 'donate' | 'admin' 
}

const publicNavItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: <Home className="w-5 h-5" />, section: 'home' },
  { id: 'news', label: 'Actualités', icon: <Newspaper className="w-5 h-5" />, section: 'news' },
  { id: 'vision', label: 'Vision', icon: <Eye className="w-5 h-5" />, section: 'vision' },
  { id: 'join', label: 'Rejoindre', icon: <UserPlus className="w-5 h-5" />, section: 'join' },
  { id: 'donate', label: 'Dons', icon: <Heart className="w-5 h-5" />, section: 'donate' },
]

export function MobileBottomNav() {
  const { currentSection, setCurrentSection } = useAppStore()

  // Show only 5 items max on bottom nav
  const visibleItems = publicNavItems.slice(0, 5)

  const handleNavClick = (section: NavItem['section']) => {
    setCurrentSection(section)
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  return (
    <>
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


    </>
  )
}
