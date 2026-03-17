import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  photo: string | null
  role: string
  status: string
  membershipNumber: string | null
  membershipDate: string | null
  residenceType: string
  country: string | null
  cityAbroad: string | null
  region?: { id: string; name: string } | null
  department?: { id: string; name: string } | null
  commune?: { id: string; name: string } | null
}

type Section = 'home' | 'news' | 'vision' | 'join' | 'donate' | 'login' | 'member' | 'admin' | 'events' | 'forgot-password'

interface AppState {
  // Navigation
  currentSection: Section
  setCurrentSection: (section: Section) => void
  
  // Member space subsections
  memberSection: 'profile' | 'card' | 'contributions' | 'messages'
  setMemberSection: (section: AppState['memberSection']) => void
  
  // Admin subsections
  adminSection: 'members' | 'stats' | 'notifications' | 'reminders' | 'content' | 'events' | 'live' | 'finances' | 'emails' | 'config' | 'logs'
  setAdminSection: (section: AppState['adminSection']) => void
  
  // Authentication
  member: Member | null
  setMember: (member: Member | null) => void
  logout: () => void
  
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
  login: '/connexion',
  member: '/membre',
  admin: '/admin',
  events: '/evenements',
  'forgot-password': '/mot-de-passe-oublie'
}

// Map URL paths to sections
const pathSections: Record<string, Section> = {
  '/': 'home',
  '/actualites': 'news',
  '/vision': 'vision',
  '/rejoindre': 'join',
  '/don': 'donate',
  '/connexion': 'login',
  '/membre': 'member',
  '/admin': 'admin',
  '/evenements': 'events',
  '/mot-de-passe-oublie': 'forgot-password'
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
      
      // Member space
      memberSection: 'profile',
      setMemberSection: (section) => set({ memberSection: section }),
      
      // Admin
      adminSection: 'members',
      setAdminSection: (section) => set({ adminSection: section }),
      
      // Auth
      member: null,
      setMember: (member) => set({ member }),
      logout: () => {
        if (typeof window !== 'undefined') {
          window.history.pushState({ section: 'home' }, '', '/')
        }
        set({ member: null, currentSection: 'home' })
      },
      
      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'rr-sunu-reew-storage',
      partialize: (state) => ({ member: state.member }),
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