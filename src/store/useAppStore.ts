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

// Get initial section from URL
const getInitialSection = (): Section => {
  if (typeof window === 'undefined') return 'home'
  const path = window.location.pathname
  return pathSections[path] || 'home'
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
    }),
    {
      name: 'rr-sunu-reew-storage',
      partialize: (state) => ({ isAdminAuthenticated: state.isAdminAuthenticated }),
    }
  )
)

// Initialize from URL and listen for browser back/forward
if (typeof window !== 'undefined') {
  // Set initial section from URL
  const initialSection = getInitialSection()
  useAppStore.setState({ currentSection: initialSection })
  
  // Listen for browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    const path = window.location.pathname
    const section = pathSections[path] || 'home'
    useAppStore.setState({ currentSection: section })
  })
}