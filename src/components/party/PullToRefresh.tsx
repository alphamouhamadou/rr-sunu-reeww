'use client'

import { useRef, useState, useCallback, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  pullDownThreshold?: number
  refreshingContent?: ReactNode
  pullingContent?: ReactNode
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  pullDownThreshold = 80,
  refreshingContent,
  pullingContent,
  className
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const touchStartY = useRef<number | null>(null)
  const scrollTop = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (container) {
      scrollTop.current = container.scrollTop
    }
    
    touchStartY.current = e.targetTouches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || touchStartY.current === null) return
    
    const container = containerRef.current
    const currentY = e.targetTouches[0].clientY
    const diff = currentY - touchStartY.current
    
    // Only allow pull when scrolled to top
    if (container && container.scrollTop <= 0 && diff > 0) {
      const distance = Math.min(diff * 0.5, pullDownThreshold * 1.5)
      setPullDistance(distance)
      
      // Prevent default scroll when pulling
      if (diff > 10) {
        e.preventDefault()
      }
    }
  }, [disabled, isRefreshing, pullDownThreshold])

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) {
      setPullDistance(0)
      setIsPulling(false)
      return
    }

    if (pullDistance >= pullDownThreshold) {
      setIsRefreshing(true)
      setPullDistance(pullDownThreshold)
      
      // Haptic feedback
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(20)
      }
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    
    touchStartY.current = null
    setIsPulling(false)
  }, [disabled, isRefreshing, pullDistance, pullDownThreshold, onRefresh])

  const refreshProgress = Math.min(pullDistance / pullDownThreshold, 1)
  const spinnerRotation = refreshProgress * 360

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center z-10 transition-all duration-200",
          "bg-[#008751]/5 dark:bg-[#008751]/10"
        )}
        style={{
          height: pullDistance,
          opacity: pullDistance > 0 ? 1 : 0
        }}
      >
        {isRefreshing ? (
          refreshingContent || (
            <div className="flex items-center gap-2 text-[#008751]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Actualisation...</span>
            </div>
          )
        ) : (
          pullingContent || (
            <div className="flex flex-col items-center gap-1 text-[#008751]">
              <div 
                className="w-8 h-8 rounded-full border-2 border-[#008751] border-t-transparent flex items-center justify-center"
                style={{ transform: `rotate(${spinnerRotation}deg)` }}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                  />
                </svg>
              </div>
              <span className="text-xs font-medium">
                {refreshProgress >= 1 ? 'Relâcher pour actualiser' : 'Tirer pour actualiser'}
              </span>
            </div>
          )
        )}
      </div>

      {/* Content container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="overflow-y-auto h-full overscroll-contain"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Simple refresh indicator for use anywhere
export function RefreshIndicator({ 
  isRefreshing, 
  progress = 0 
}: { 
  isRefreshing: boolean
  progress?: number 
}) {
  return (
    <div className={cn(
      "flex items-center justify-center py-4 transition-opacity duration-200",
      isRefreshing ? "opacity-100" : "opacity-0"
    )}>
      <div className="flex items-center gap-2 text-[#008751]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Chargement...</span>
      </div>
    </div>
  )
}
