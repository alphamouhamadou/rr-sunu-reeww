'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowLeft, Facebook, Twitter, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  category: string
  isFeatured: boolean
  createdAt: string
}

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string
  imageUrl: string | null
}

const categoryLabels: Record<string, string> = {
  actualite: 'Actualité',
  communique: 'Communiqué',
  evenement: 'Événement',
}

const categoryColors: Record<string, string> = {
  actualite: 'bg-[#008751]',
  communique: 'bg-[#CE1126]',
  evenement: 'bg-[#FFD100] text-black',
}

export function NewsSection() {
  const { setCurrentSection } = useAppStore()
  const [articles, setArticles] = useState<Article[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/articles').then(res => res.json()),
      fetch('/api/events?limit=20').then(res => res.json())
    ])
      .then(([articlesData, eventsData]) => {
        setArticles(articlesData.articles || [])
        setEvents(eventsData.events || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredArticles = filter === 'all' 
    ? articles 
    : articles.filter(a => a.category === filter)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = (title: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(title)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 border-4 border-[#008751] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des actualités...</p>
      </div>
    )
  }

  // Vue détaillée d'un article
  if (selectedArticle) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setSelectedArticle(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux actualités
        </Button>

        <article className="max-w-3xl mx-auto">
          <Badge className={`mb-4 ${categoryColors[selectedArticle.category] || 'bg-gray-500'}`}>
            {categoryLabels[selectedArticle.category] || selectedArticle.category}
          </Badge>
          
          <h1 className="text-3xl font-bold mb-4">{selectedArticle.title}</h1>
          
          {selectedArticle.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedArticle.createdAt)}
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareOnFacebook}
                className="text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => shareOnTwitter(selectedArticle.title)}
                className="text-[#1DA1F2] border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10"
              >
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {selectedArticle.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    )
  }

  // Vue détaillée d'un événement
  if (selectedEvent) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => setSelectedEvent(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux événements
        </Button>

        <article className="max-w-3xl mx-auto">
          <Badge className="mb-4 bg-[#FFD100] text-black">
            Événement
          </Badge>
          
          <h1 className="text-3xl font-bold mb-4">{selectedEvent.title}</h1>
          
          {selectedEvent.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={selectedEvent.imageUrl} 
                alt={selectedEvent.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedEvent.date)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {selectedEvent.location}
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareOnFacebook}
                className="text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/10"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => shareOnTwitter(selectedEvent.title)}
                className="text-[#1DA1F2] border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10"
              >
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedEvent.description && (
            <div className="prose prose-lg max-w-none">
              {selectedEvent.description.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </article>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="party-gradient text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Actualités & Communiqués</h1>
            <p className="text-xl text-green-100">
              Restez informé des dernières nouvelles du parti.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-[#008751] hover:bg-[#006b40]' : ''}
          >
            Tous
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className={filter === key ? 'bg-[#008751] hover:bg-[#006b40]' : ''}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Événements - Afficher quand le filtre est "evenement" */}
        {filter === 'evenement' ? (
          <>
            {events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card 
                    key={event.id}
                    className="cursor-pointer hover:shadow-lg transition group overflow-hidden"
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Event Image */}
                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#008751] to-[#006b40]">
                          <Calendar className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <Badge className="bg-[#FFD100] text-black mb-3">
                        Événement
                      </Badge>
                      
                      <h2 className="font-semibold text-lg mb-2 group-hover:text-[#008751] transition">
                        {event.title}
                      </h2>
                      
                      {event.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatShortDate(event.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Aucun événement à venir.
              </div>
            )}
          </>
        ) : (
          /* Articles Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card 
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition group overflow-hidden"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Article Image */}
                <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#008751] to-[#006b40]">
                      <span className="text-white text-4xl font-bold opacity-50">RR</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={categoryColors[article.category] || 'bg-gray-500'}>
                      {categoryLabels[article.category] || article.category}
                    </Badge>
                    {article.isFeatured && (
                      <Badge variant="outline" className="border-[#FFD100] text-[#008751]">
                        À la une
                      </Badge>
                    )}
                  </div>
                  
                  <h2 className="font-semibold text-lg mb-2 group-hover:text-[#008751] transition">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(article.createdAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filter !== 'evenement' && filteredArticles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun article trouvé pour cette catégorie.
          </div>
        )}
      </div>
    </div>
  )
}