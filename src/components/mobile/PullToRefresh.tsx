'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
}

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isPulling = useRef(false)

  const threshold = 80

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const scrollTop = containerRef.current?.scrollTop ?? 0
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      // Prevent default scroll when pulling
      if (diff > 10) {
        e.preventDefault()
      }
      
      // Apply resistance
      const distance = Math.min(diff * 0.5, 150)
      setPullDistance(distance)
    }
  }, [disabled, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || disabled || isRefreshing) return

    isPulling.current = false

    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }, [pullDistance, threshold, onRefresh, disabled, isRefreshing])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div ref={containerRef} className="relative overflow-y-auto h-full">
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center",
          "transition-all duration-200 z-50",
          "pointer-events-none"
        )}
        style={{
          height: `${pullDistance}px`,
          opacity: progress,
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-white dark:bg-gray-800",
            "shadow-lg flex items-center justify-center",
            "border-2 border-[#008751]",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: `rotate(${isRefreshing ? 0 : rotation}deg) scale(${0.5 + progress * 0.5})`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 text-[#008751]" />
          ) : (
            <svg
              className="w-5 h-5 text-[#008751]"
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
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "transition-transform duration-200",
          !isRefreshing && pullDistance > 0 && "translate-y-0"
        )}
        style={{
          transform: isRefreshing ? 'translateY(60px)' : `translateY(${pullDistance * 0.3}px)`,
        }}
      >
        {children}
      </div>

      {/* Refreshing overlay */}
      {isRefreshing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin text-[#008751]" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Actualisation...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
