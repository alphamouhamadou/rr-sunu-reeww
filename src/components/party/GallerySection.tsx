'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ImageIcon, X, ChevronLeft, ChevronRight, Loader2, Calendar, MapPin
} from 'lucide-react'

interface Photo {
  id: string
  title: string
  description: string | null
  imageUrl: string
  thumbnailUrl: string | null
  category: string
  isFeatured: boolean
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  general: 'Général',
  event: 'Événements',
  meeting: 'Meetings',
  campaign: 'Campagnes',
}

export function GallerySection() {
  const { currentSection } = useAppStore()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/gallery')
        const data = await res.json()
        setPhotos(data.photos || [])
      } catch (error) {
        console.error('Error fetching photos:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [])

  const filteredPhotos = activeCategory === 'all' 
    ? photos 
    : photos.filter(p => p.category === activeCategory)

  const featuredPhotos = photos.filter(p => p.isFeatured)

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex < 0) newIndex = filteredPhotos.length - 1
    if (newIndex >= filteredPhotos.length) newIndex = 0
    
    setSelectedPhoto(filteredPhotos[newIndex])
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#008751]" />
        <p className="mt-4 text-gray-600">Chargement de la galerie...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full party-gradient flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#008751] mb-2">
          Galerie Photos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Découvrez les moments forts de Renaissance Républicaine Sunu Reew à travers nos photos.
        </p>
      </div>

      {/* Featured Photos */}
      {featuredPhotos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#008751]">Photos à la une</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {featuredPhotos.slice(0, 2).map((photo) => (
              <div 
                key={photo.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg aspect-video"
                onClick={() => openLightbox(photo)}
              >
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-gray-200 text-sm line-clamp-2">{photo.description}</p>
                    )}
                  </div>
                </div>
                <Badge className="absolute top-2 right-2 bg-[#FFD100] text-black">
                  À la une
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-[#008751] data-[state=active]:text-white"
          >
            Toutes
          </TabsTrigger>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger 
              key={key}
              value={key}
              className="data-[state=active]:bg-[#008751] data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune photo dans cette catégorie</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
              onClick={() => openLightbox(photo)}
            >
              <img 
                src={photo.thumbnailUrl || photo.imageUrl} 
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-sm font-medium line-clamp-1">{photo.title}</p>
                  <Badge variant="outline" className="text-xs mt-1 bg-black/50 border-white/30 text-white">
                    {categoryLabels[photo.category] || photo.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-10 p-2 rounded-full bg-black/50 hover:bg-black/70"
            onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-10 p-2 rounded-full bg-black/50 hover:bg-black/70"
            onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div 
            className="max-w-5xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto.imageUrl} 
              alt={selectedPhoto.title}
              className="max-h-[70vh] object-contain rounded-lg"
            />
            <div className="bg-black/50 p-4 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold">{selectedPhoto.title}</h3>
              {selectedPhoto.description && (
                <p className="text-gray-300 mt-1">{selectedPhoto.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <Badge variant="outline" className="border-[#008751] text-[#008751]">
                  {categoryLabels[selectedPhoto.category] || selectedPhoto.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedPhoto.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
