'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Radio, Calendar, Clock, Play, Users, ExternalLink, 
  Youtube, Facebook, AlertCircle, Loader2
} from 'lucide-react'

interface LiveStream {
  id: string
  title: string
  description: string | null
  platform: string
  streamUrl: string
  streamId: string | null
  thumbnailUrl: string | null
  isLive: boolean
  isScheduled: boolean
  scheduledAt: string | null
  startedAt: string | null
  viewerCount: number
  createdAt: string
}

export function LiveStreamSection() {
  const { setCurrentSection } = useAppStore()
  const [currentLive, setCurrentLive] = useState<LiveStream | null>(null)
  const [upcomingLives, setUpcomingLives] = useState<LiveStream[]>([])
  const [pastLives, setPastLives] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/livestreams')
        const data = await res.json()
        
        const streams: LiveStream[] = data.streams || []
        
        // Find current live
        const live = streams.find(s => s.isLive)
        setCurrentLive(live || null)
        
        // Upcoming streams (scheduled but not live yet)
        const upcoming = streams.filter(s => s.isScheduled && !s.isLive && !s.startedAt)
        setUpcomingLives(upcoming)
        
        // Past streams (ended)
        const past = streams.filter(s => s.startedAt && !s.isLive)
        setPastLives(past.slice(0, 4)) // Show max 4 past streams
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching live streams:', error)
        setLoading(false)
      }
    }

    loadData()
    
    // Refresh every 30 seconds
    intervalRef.current = setInterval(loadData, 30000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />
      default:
        return <Radio className="w-5 h-5 text-[#008751]" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'YouTube'
      case 'facebook':
        return 'Facebook'
      default:
        return 'Live'
    }
  }

  const getEmbedUrl = (stream: LiveStream) => {
    if (stream.platform === 'youtube' && stream.streamId) {
      return `https://www.youtube.com/embed/${stream.streamId}?autoplay=1`
    }
    if (stream.platform === 'facebook' && stream.streamId) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(stream.streamUrl)}`
    }
    return stream.streamUrl
  }

  const getThumbnail = (stream: LiveStream) => {
    if (stream.thumbnailUrl) return stream.thumbnailUrl
    if (stream.platform === 'youtube' && stream.streamId) {
      return `https://img.youtube.com/vi/${stream.streamId}/maxresdefault.jpg`
    }
    return null
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#008751]" />
        </div>
      </section>
    )
  }

  // No streams at all
  if (!currentLive && upcomingLives.length === 0 && pastLives.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="w-6 h-6 text-[#008751]" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Diffusions en Direct
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez nos meetings et événements en live
          </p>
        </div>

        {/* Current Live Stream */}
        {currentLive && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-600 font-semibold uppercase text-sm tracking-wide">
                EN DIRECT
              </span>
            </div>

            <Card className="overflow-hidden shadow-xl border-2 border-red-500/20">
              {showPlayer ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={getEmbedUrl(currentLive)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div 
                  className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 relative cursor-pointer group"
                  onClick={() => setShowPlayer(true)}
                >
                  {getThumbnail(currentLive) && (
                    <img 
                      src={getThumbnail(currentLive)!} 
                      alt={currentLive.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 rounded-full p-6 group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      {currentLive.title}
                    </h3>
                    {currentLive.description && (
                      <p className="text-gray-300 line-clamp-2">{currentLive.description}</p>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        LIVE
                      </span>
                    </Badge>
                    <Badge className="bg-black/50 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {currentLive.viewerCount} spectateurs
                    </Badge>
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(currentLive.platform)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Diffusé sur {getPlatformName(currentLive.platform)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentLive.streamUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ouvrir sur {getPlatformName(currentLive.platform)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Live Streams */}
        {upcomingLives.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#008751]" />
              Prochains directs
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingLives.map((stream) => (
                <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-[#008751] to-[#006b40] relative">
                    {getThumbnail(stream) && (
                      <img 
                        src={getThumbnail(stream)!} 
                        alt={stream.title}
                        className="w-full h-full object-cover opacity-50"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-[#FFD100] text-black">
                        À venir
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {stream.title}
                    </h4>
                    {stream.scheduledAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(stream.scheduledAt)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {getPlatformIcon(stream.platform)}
                      <span className="text-xs text-gray-500">{getPlatformName(stream.platform)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Live Streams (Replays) */}
        {pastLives.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-[#008751]" />
              Rediffusions
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pastLives.map((stream) => (
                <Card 
                  key={stream.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => window.open(stream.streamUrl, '_blank')}
                >
                  <div className="aspect-video bg-gray-800 relative">
                    {getThumbnail(stream) && (
                      <img 
                        src={getThumbnail(stream)!} 
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-2">
                        <Play className="w-6 h-6 text-[#008751] fill-[#008751]" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      {getPlatformIcon(stream.platform)}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                      {stream.title}
                    </h4>
                    {stream.startedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(stream.startedAt)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
