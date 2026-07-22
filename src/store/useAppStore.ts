import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Section = 'home' | 'news' | 'vision' | 'join' | 'donate' | 'admin' | 'events'

interface AppState {
  // Navigation
  currentSection: Section
  setCurrentSection: (section: Section) => void
  
  // Admin subsections
  adminSection: 'members' | 'stats' | 'notifications' | 'reminders' | 'content' | 'events' | 'live' | 'finances' | 'emails' | 'config' | 'logs'
  setAdminSection: (section: AppState['adminSection']) => void
  
  // Admin authentication
  isAdminAuthenticated: boolean
  setIsAdminAuthenticated: (auth: boolean) => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Hydration
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

// Map sections to URL paths
const sectionPaths: Record<Section, string> = {
  home: '/',
  news: '/actualites',
  vision: '/vision',
  join: '/rejoindre',
  donate: '/don',
  admin: '/admin',
  events: '/evenements'
}

// Map URL paths to sections
const pathSections: Record<string, Section> = {
  '/': 'home',
  '/actualites': 'news',
  '/vision': 'vision',
  '/rejoindre': 'join',
  '/don': 'donate',
  '/admin': 'admin',
  '/evenements': 'events'
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentSection: 'home',
      setCurrentSection: (section) => {
        // Update browser history
        if (typeof window !== 'undefined') {
          const path = sectionPaths[section] || '/'
          const currentPath = window.location.pathname
          
          // Only push to history if path is different
          if (currentPath !== path) {
            window.history.pushState({ section }, '', path)
          }
        }
        set({ currentSection: section })
      },
      
      // Admin
      adminSection: 'members',
      setAdminSection: (section) => set({ adminSection: section }),
      
      // Admin Auth
      isAdminAuthenticated: false,
      setIsAdminAuthenticated: (auth) => set({ isAdminAuthenticated: auth }),
      
      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Hydration tracking
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'rr-sunu-reew-storage',
      partialize: (state) => ({ isAdminAuthenticated: state.isAdminAuthenticated }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            state.setHasHydrated(true)
          }
        }
      },
    }
  )
)

// Hook to safely listen for browser back/forward
export function useBrowserNavigation() {
  if (typeof window === 'undefined') return
  
  // Set initial section from URL
  const path = window.location.pathname
  const section = pathSections[path]
  if (section) {
    useAppStore.setState({ currentSection: section })
  }
  
  // Listen for browser back/forward buttons
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname
    const currentSection = pathSections[currentPath] || 'home'
    useAppStore.setState({ currentSection: currentSection })
  })
}
